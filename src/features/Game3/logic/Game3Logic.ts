// src/features/Game3/logic/Game3Logic.ts
import { Game3MainSchema, Game3PlatformsSchema } from '../model/Game3LogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { Game3Commands } from './Game3Commands';
import { Game3Config } from '../model/Game3Config';
import { ParsedMapData, PlatformData } from './Game3MapData';
import { Game3Collision } from './Game3Collision';
import { Game3Hazards } from './Game3Hazards';
import { ITEM_NONE, getItemDef } from '../../../core/inventory/ItemRegistry';

// Point values for platformer events
const EXIT_REACHED_POINTS = 200;
const EXIT_REACHED_COINS = 10;

export class Game3Logic extends BaseLogic<Game3Config> {
    protected dispatcher: BaseDispatcher<Game3Logic>;

    private collision: Game3Collision;
    private hazards: Game3Hazards;

    // State
    private hp = 100;
    private hero = { x: 0, y: 0, vx: 0, vy: 0 };
    private isOnGround = false;
    private isWallSliding = false;
    private wallJumpTimer = 0;
    private wallJumpDirection = 0;
    private isClinging = false;
    private ledgeGrabCooldown = 0;
    private isMantling = false;
    private mantleTimer = 0;
    private mantleStartX = 0;
    private mantleStartY = 0;
    private mantleTargetX = 0;
    private mantleTargetY = 0;
    private mantleFloatX = 0;
    private mantleFloatY = 0;
    private wallJumpCooldown = 0;
    private clingJumpGrace = 0;
    private spikeDamageTimer = 0;
    private wasInSpike = false;
    private portalCooldown = 0;
    private isJumpingFromGround = false;
    private hasCompletedLevel = false;
    private spawnPoint = { x: 0, y: 0 };

    // Config
    private heroWidth = 1.0;
    private heroHeight = 1.0;
    private worldScale = 32;
    private playerScale = 1.0;
    private playerOffsetY = 0;
    private platforms: PlatformData[] = [];

    // Movement settings
    private moveSpeed = 0.25;
    private jumpPower = -0.4;
    private gravity = 0.04;
    private friction = 0.5;
    private wallJumpPowerMultiplier = 1.225; // ~50% higher peak vs base jump (sqrt(1.5))

    // Economy — persisted cross-game via session
    private points: number = 0;
    private coins: number = 0;

    // Inventory — single held item, persisted cross-game via session
    private heldItemId: number = ITEM_NONE;

    constructor() {
        super(Game3MainSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game3Commands, "Game3");
        this.collision = new Game3Collision(this);
        this.hazards = new Game3Hazards(this, this.collision);
    }

    public applyConfig(config: Game3Config): void {
        this.config = config;
        this.hp = config.initialHP;
        this.worldScale = config.worldScale || 32;
        this.playerScale = config.playerScale || 1.0;
        this.playerOffsetY = config.playerOffsetY || 0;
        this.heroWidth = config.heroWidth || 1.0;
        this.heroHeight = config.heroHeight || 2.0;

        // Restore economy from config if provided (session overrides flow through config)
        if ((config as any).initialPoints !== undefined) {
            this.points = (config as any).initialPoints;
        }
        if ((config as any).initialCoins !== undefined) {
            this.coins = (config as any).initialCoins;
        }

        // Restore inventory from config if provided (session overrides)
        if ((config as any).initialHeldItem !== undefined) {
            this.heldItemId = (config as any).initialHeldItem;
        }
    }

    public setMapData(data: ParsedMapData) {
        this.platforms = data.platforms;
        this.hero.x = data.playerStart.x;
        this.hero.y = data.playerStart.y;
        this.spawnPoint = { x: data.playerStart.x, y: data.playerStart.y };
        this.hero.vx = 0;
        this.hero.vy = 0;
        this.hasCompletedLevel = false;

        if (data.playerStart.width && data.playerStart.height) {
            this.heroWidth = data.playerStart.width;
            this.heroHeight = data.playerStart.height;
        }
    }

    /**
     * Use the currently held item. Called via USE_ITEM command (Q key).
     * Passive items (like Life Totem) cannot be manually used.
     */
    public useHeldItem(): void {
        if (this.heldItemId === ITEM_NONE) return;

        const def = getItemDef(this.heldItemId);
        if (!def || !def.onUse) return;

        // Passive items trigger automatically (e.g. Life Totem on death), not via Q
        if (def.passive) return;

        const result = def.onUse({ hp: this.hp, maxHp: 100 });
        if (!result) return; // Item says don't consume (e.g. HP already full)

        if (result.hpDelta) {
            this.hp = Math.max(0, Math.min(100, this.hp + result.hpDelta));
        }

        // Consume the item
        this.heldItemId = ITEM_NONE;
        self.postMessage({ type: 'EVENT', name: 'ITEM_USED' });
    }

    /**
     * Attempt to auto-trigger a passive held item on death.
     * Returns true if the player was revived.
     */
    private tryPassiveRevive(): boolean {
        if (this.heldItemId === ITEM_NONE) return false;

        const def = getItemDef(this.heldItemId);
        if (!def || !def.passive || !def.onUse) return false;

        const result = def.onUse({ hp: 0, maxHp: 100 });
        if (!result || !result.revive) return false;

        // Revive the player with the item's heal amount
        const healAmount = result.hpDelta ?? 50;
        this.hp = Math.max(0, Math.min(100, healAmount));

        // Consume the totem
        this.heldItemId = ITEM_NONE;
        self.postMessage({ type: 'EVENT', name: 'ITEM_USED' });
        self.postMessage({ type: 'EVENT', name: 'PLAYER_REVIVED' });
        return true;
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config || !this.isInitialized) return;

        this.isOnGround = this.collision.checkIsOnGround();

        this.updateHeroMovement();
        if (!this.isMantling && !this.isClinging) {
            this.collision.resolveMovement();
        }

        this.hazards.updateExitLogic();
        this.hazards.updateSpikeLogic();
        this.hazards.updatePortalLogic();
        this.hazards.updateVoidLogic();
        this.hazards.updateCoinLogic();


        this.syncToSAB(sharedView, frameCount, fps);
    }

    public isAction(action: string): boolean {
        return this.inputState && this.inputState.actions && this.inputState.actions.includes(action);
    }

    private updateHeroMovement() {
        // Timers
        if (this.wallJumpCooldown > 0) this.wallJumpCooldown--;
        if (this.wallJumpTimer > 0) this.wallJumpTimer--;
        if (this.ledgeGrabCooldown > 0) this.ledgeGrabCooldown--;
        if (this.clingJumpGrace > 0) this.clingJumpGrace--;

        // Mantling State Logic
        if (this.isMantling) {
            this.mantleTimer++;
            const totalDuration = 90; // 1.5s
            const t = this.mantleTimer / totalDuration;

            if (t >= 1) {
                this.hero.x = this.mantleTargetX;
                this.hero.y = this.mantleTargetY;
                this.isMantling = false;
                this.mantleTimer = 0;
                this.ledgeGrabCooldown = 30; // 0.5s cooldown to prevent immediate re-grabbing after mantle
            } else {
                // Two-phase mantle:
                // Phase 1 (0.0 to 0.5): Move diagonally to the floating position (up and away)
                // Phase 2 (0.5 to 1.0): Move from floating position to the top center
                if (t < 0.5) {
                    const phaseT = t / 0.5;
                    this.hero.x = this.mantleStartX + (this.mantleFloatX - this.mantleStartX) * phaseT;
                    this.hero.y = this.mantleStartY + (this.mantleFloatY - this.mantleStartY) * phaseT;
                } else {
                    const phaseT = (t - 0.5) / 0.5;
                    this.hero.x = this.mantleFloatX + (this.mantleTargetX - this.mantleFloatX) * phaseT;
                    this.hero.y = this.mantleFloatY + (this.mantleTargetY - this.mantleFloatY) * phaseT;
                }
            }
            this.hero.vx = 0;
            this.hero.vy = 0;
            return;
        }

        // Collision Check
        const { side: wallSide, platform: wallPlatform } = this.collision.getWallCollisionData();

        // Inputs
        const moveLeft = this.isAction('MOVE_LEFT');
        const moveRight = this.isAction('MOVE_RIGHT');
        const moveUp = this.isAction('MOVE_UP');
        const moveDown = this.isAction('MOVE_DOWN');
        const jumpPressed = this.isAction('JUMP');

        let moveDir = 0;
        if (moveLeft) moveDir -= 1;
        if (moveRight) moveDir += 1;

        // Clinging State Logic
        if (this.isClinging) {
            // Check if still touching the same wall platform
            if (wallSide === 0 || !wallPlatform) {
                this.isClinging = false;
            } else {
                // Keep velocities zero
                this.hero.vx = 0;
                this.hero.vy = 0;

                // Handle Inputs
                if (moveUp) {
                    if (this.clingJumpGrace > 0) return;
                    // Mantle: initiate transition
                    this.isMantling = true;
                    this.isClinging = false;
                    this.isWallSliding = false;
                    this.mantleTimer = 0;
                    this.mantleStartX = this.hero.x;
                    this.mantleStartY = this.hero.y;

                    // Target: Sitting on top center of platform
                    this.mantleTargetY = wallPlatform.y - this.heroHeight;
                    this.mantleTargetX = wallPlatform.x + (wallPlatform.width / 2) - (this.heroWidth / 2);

                    // Floating position: slightly higher than diagonal to clear the ledge completely
                    const floatXGap = 0.2;
                    const floatYGap = 0.6; // Slightly higher gap for vertical clearance

                    if (wallSide === 1) { // Platform to the right, hero is on left side
                        this.mantleFloatX = wallPlatform.x - this.heroWidth - floatXGap;
                    } else { // Platform to the left, hero is on right side
                        this.mantleFloatX = wallPlatform.x + wallPlatform.width + floatXGap;
                    }
                    this.mantleFloatY = wallPlatform.y - this.heroHeight - floatYGap;

                    return;
                }
                if (moveDown) {
                    if (this.clingJumpGrace > 0) return;
                    // Disengage: drop down
                    this.isClinging = false;
                    this.hero.vy = 0.01; // Small nudge
                    this.ledgeGrabCooldown = 30; // 0.5 seconds at 60fps
                    return;
                }
                if (jumpPressed) {
                    if (this.clingJumpGrace > 0) return;
                    // Jump from ledge
                    this.hero.vy = this.jumpPower * this.wallJumpPowerMultiplier;
                    // If moving opposite of wallSide, jump further
                    if ((wallSide === -1 && moveDir === 1) || (wallSide === 1 && moveDir === -1)) {
                        this.wallJumpDirection = -wallSide;
                        this.wallJumpTimer = 20; // Extra boost
                    } else {
                        this.wallJumpDirection = -wallSide;
                        this.wallJumpTimer = 15;
                    }
                    this.isClinging = false;
                    this.wallJumpCooldown = 30; // 0.5s delay
                    return;
                }
                return; // Staying in cling
            }
        }

        // --- Standard Movement (not clinging) ---

        // Wall Jump Timer handles horizontal movement during jump
        if (this.wallJumpTimer > 0) {
            this.hero.vx = this.wallJumpDirection * this.moveSpeed * 1.5;
            this.wallJumpTimer--;
        } else {
            if (moveDir !== 0) {
                this.hero.vx = moveDir * this.moveSpeed;
            } else {
                this.hero.vx *= this.friction;
                if (Math.abs(this.hero.vx) < 0.01) this.hero.vx = 0;
            }
        }

        // Sliding Logic
        this.isWallSliding = false;
        if (!this.isOnGround && wallSide !== 0 && wallPlatform) {
            const movingAway = (wallSide === -1 && moveDir === 1) || (wallSide === 1 && moveDir === -1);
            if (!movingAway) {
                this.isWallSliding = true;

                // Cling Entry Logic
                // Only enter cling if moving downwards or stationary vertically
                const atTop = this.hero.y <= wallPlatform.y + 0.1;
                const canClingFallthrough = !wallPlatform.isFallthrough ||
                    (this.hero.vy >= 0 && !this.isAction('MOVE_DOWN'));

                if (atTop && canClingFallthrough && !this.collision.isWallAbove(wallPlatform) && this.ledgeGrabCooldown === 0) {
                    this.isClinging = true;
                    this.hero.vx = 0;
                    this.hero.vy = 0;
                    if (wallSide === 1) {
                        this.hero.x = wallPlatform.x - this.heroWidth;
                    } else if (wallSide === -1) {
                        this.hero.x = wallPlatform.x + wallPlatform.width;
                    }
                    this.hero.y = wallPlatform.y;
                    this.clingJumpGrace = 30; // ~0.5s at 60fps for any cling action
                    this.wallJumpTimer = 0;
                    return;
                }
            }
        }

        // Gravity
        let effectiveGravity = this.gravity;
        if (this.isJumpingFromGround && jumpPressed && this.hero.vy < 0) {
            effectiveGravity *= 0.5;
        }

        if (this.isWallSliding && this.hero.vy > 0) {
            this.hero.vy += effectiveGravity * 0.2;
            if (this.hero.vy > 0.1) this.hero.vy = 0.1;
        } else {
            this.hero.vy += effectiveGravity;
        }

        // Jumping
        if (jumpPressed) {
            if (this.isOnGround) {
                this.hero.vy = this.jumpPower;
                this.wallJumpTimer = 0;
                this.isJumpingFromGround = true;
            } else if (wallSide !== 0 && wallPlatform && wallPlatform.isWall && this.wallJumpCooldown <= 0) {
                this.hero.vy = this.jumpPower * this.wallJumpPowerMultiplier;
                this.wallJumpDirection = -wallSide;
                this.wallJumpTimer = 15;
                this.isWallSliding = false;
                this.isJumpingFromGround = false;
                this.wallJumpCooldown = 30; // 0.5s delay
            }
        }

        if (this.hero.vy >= 0) this.isJumpingFromGround = false;
        if (this.hero.vy > 0.8) this.hero.vy = 0.8;
    }

    private getPlatformType(p: PlatformData): number {
        if (p.isExit) return 5;
        if (p.isPortal) return 4;
        if (p.isSpike) return 3;
        if (p.isVoid) return 2;
        if (p.isWall) return 1;
        if (p.isFallthrough) return 6;
        if (p.isPlat) return 7;
        if (p.isNonWallJumpableWall) return 8;
        if (p.isDisplayWall) return 9;
        if (p.isGrassForeground) return 10;
        if (p.isGrassBackground) return 11;
        if (p.isNonOrganicForeground) return 12;
        if (p.isNonOrganicBackground) return 13;
        if (p.isCoinCollectable) return 14;
        if (p.isFloor) return 0;
        return 0;
    }

    private syncToSAB(sMain: Float32Array, frameCount: number, fps: number) {
        // Access the additional platform buffer from the protected map in BaseLogic
        const sPlatforms = this.sharedViews.get('platforms');
        if (!sMain || !sPlatforms) return;

        const M = Game3MainSchema;
        sMain[M.FRAME_COUNT] = frameCount;
        sMain[M.FPS] = fps;

        sMain[M.HERO_X] = this.hero.x;
        sMain[M.HERO_Y] = this.hero.y;
        sMain[M.HERO_VX] = this.hero.vx;
        sMain[M.HERO_VY] = this.hero.vy;
        sMain[M.HERO_HP] = this.hp;

        sMain[M.HERO_WIDTH] = this.heroWidth;
        sMain[M.HERO_HEIGHT] = this.heroHeight;
        sMain[M.WORLD_SCALE] = this.worldScale;
        sMain[M.PLAYER_SCALE] = this.playerScale;
        sMain[M.PLAYER_OFFSET_Y] = this.playerOffsetY;

        sMain[M.IS_ON_GROUND] = this.isOnGround ? 1 : 0;
        sMain[M.IS_WALL_SLIDING] = this.isWallSliding ? 1 : 0;
        sMain[M.IS_CLINGING] = this.isClinging ? 1 : 0;
        sMain[M.IS_MANTLING] = this.isMantling ? 1 : 0;
        sMain[M.MANTLE_PROGRESS] = this.isMantling ? (this.mantleTimer / 180) : 0;
        sMain[M.LEDGE_GRAB_COOLDOWN] = this.ledgeGrabCooldown;
        sMain[M.WALL_JUMP_TIMER] = this.wallJumpTimer;
        sMain[M.WALL_JUMP_COOLDOWN] = this.wallJumpCooldown;
        sMain[M.WALL_JUMP_DIRECTION] = this.wallJumpDirection;
        sMain[M.SPIKE_DAMAGE_TIMER] = this.spikeDamageTimer;
        sMain[M.WAS_IN_SPIKE] = this.wasInSpike ? 1 : 0;
        sMain[M.PORTAL_COOLDOWN] = this.portalCooldown;
        sMain[M.IS_JUMPING_FROM_GROUND] = this.isJumpingFromGround ? 1 : 0;
        sMain[M.HAS_COMPLETED_LEVEL] = this.hasCompletedLevel ? 1 : 0;
        sMain[M.SPAWN_X] = this.spawnPoint.x;
        sMain[M.SPAWN_Y] = this.spawnPoint.y;

        sMain[M.MOVE_SPEED] = this.moveSpeed;
        sMain[M.JUMP_POWER] = this.jumpPower;
        sMain[M.GRAVITY] = this.gravity;
        sMain[M.FRICTION] = this.friction;

        // Economy
        sMain[M.POINTS] = this.points;
        sMain[M.COINS] = this.coins;

        // Inventory
        sMain[M.HELD_ITEM_ID] = this.heldItemId;

        const capacity = Math.floor(sPlatforms.length / Game3PlatformsSchema.STRIDE);
        const objCount = Math.min(this.platforms.length, capacity);
        sMain[M.OBJ_COUNT] = objCount;

        for (let i = 0; i < objCount; i++) {
            const p = this.platforms[i];
            const idx = i * Game3PlatformsSchema.STRIDE;
            sPlatforms[idx] = p.x;
            sPlatforms[idx + 1] = p.y;
            sPlatforms[idx + 2] = p.width;
            sPlatforms[idx + 3] = p.height;
            sPlatforms[idx + 4] = this.getPlatformType(p);
        }
    }

    public override getSnapshot() {
        return {
            hero: { ...this.hero },
            hp: this.hp,
            wallJumpTimer: this.wallJumpTimer,
            wallJumpDirection: this.wallJumpDirection,
            isWallSliding: this.isWallSliding,
            spikeDamageTimer: this.spikeDamageTimer,
            wasInSpike: this.wasInSpike,
            portalCooldown: this.portalCooldown,
            isJumpingFromGround: this.isJumpingFromGround,
            spawnPoint: { ...this.spawnPoint },
            hasCompletedLevel: this.hasCompletedLevel,
            points: this.points,
            coins: this.coins,
            heldItemId: this.heldItemId,
            isClinging: this.isClinging,
            isMantling: this.isMantling,
            ledgeGrabCooldown: this.ledgeGrabCooldown,
            mantleTimer: this.mantleTimer,
            mantleFloatX: this.mantleFloatX,
            mantleFloatY: this.mantleFloatY,
            mantleStartX: this.mantleStartX,
            mantleStartY: this.mantleStartY,
            mantleTargetX: this.mantleTargetX,
            mantleTargetY: this.mantleTargetY,
            clingJumpGrace: this.clingJumpGrace
        };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.hero = data.hero || this.hero;
            this.hp = data.hp ?? this.hp;
            this.wallJumpTimer = data.wallJumpTimer ?? 0;
            this.wallJumpDirection = data.wallJumpDirection ?? 0;
            this.isWallSliding = data.isWallSliding ?? false;
            this.spikeDamageTimer = data.spikeDamageTimer ?? 0;
            this.wasInSpike = data.wasInSpike ?? false;
            this.portalCooldown = data.portalCooldown ?? 0;
            this.isJumpingFromGround = data.isJumpingFromGround ?? false;
            this.spawnPoint = data.spawnPoint || this.spawnPoint;
            this.hasCompletedLevel = data.hasCompletedLevel ?? false;
            this.points = data.points ?? 0;
            this.coins = data.coins ?? 0;
            this.heldItemId = data.heldItemId ?? ITEM_NONE;
            this.isClinging = data.isClinging ?? false;
            this.isMantling = data.isMantling ?? false;
            this.ledgeGrabCooldown = data.ledgeGrabCooldown ?? 0;
            this.mantleTimer = data.mantleTimer ?? 0;
            this.mantleFloatX = data.mantleFloatX ?? 0;
            this.mantleFloatY = data.mantleFloatY ?? 0;
            this.mantleStartX = data.mantleStartX ?? 0;
            this.mantleStartY = data.mantleStartY ?? 0;
            this.mantleTargetX = data.mantleTargetX ?? 0;
            this.mantleTargetY = data.mantleTargetY ?? 0;
            this.clingJumpGrace = data.clingJumpGrace ?? 0;
            this.isInitialized = true;
        }
    }

    public modifyHP(amount: number) {
        this.hp = Math.max(0, Math.min(100, this.hp + amount));
        if (this.hp <= 0) {
            // Try passive revive (Life Totem) before resetting to spawn
            if (this.tryPassiveRevive()) {
                // Revived — don't reset position, just keep playing with restored HP
                return;
            }
            // No revive — reset to spawn with full HP
            this.hp = 100;
            this.hero.x = this.spawnPoint.x;
            this.hero.y = this.spawnPoint.y;
            this.hero.vx = 0;
            this.hero.vy = 0;
            this.clearMovementStates();
        }
    }

    /** Award points and coins for reaching the exit */
    public awardExitReward() {
        this.points += EXIT_REACHED_POINTS;
        this.coins += EXIT_REACHED_COINS;
    }

    public addCoins(amount: number) {
        this.coins += amount;
    }

    public clearMovementStates() {
        this.isClinging = false;
        this.isMantling = false;
        this.isWallSliding = false;
        this.wallJumpTimer = 0;
        this.wallJumpCooldown = 0;
        this.ledgeGrabCooldown = 0;
        this.mantleTimer = 0;
        this.mantleFloatX = 0;
        this.mantleFloatY = 0;
        this.mantleStartX = 0;
        this.mantleStartY = 0;
        this.mantleTargetX = 0;
        this.mantleTargetY = 0;
        this.clingJumpGrace = 0;
    }

    public get heroState() { return this.hero; }
    public get platformList() { return this.platforms; }
    public get dimensions() {
        return { width: this.heroWidth, height: this.heroHeight };
    }
    public get spawn() { return this.spawnPoint; }

    public get spikeTimer() { return this.spikeDamageTimer; }
    public set spikeTimer(val: number) { this.spikeDamageTimer = val; }

    public get inSpike() { return this.wasInSpike; }
    public set inSpike(val: boolean) { this.wasInSpike = val; }

    public get portalTimer() { return this.portalCooldown; }
    public set portalTimer(val: number) { this.portalCooldown = val; }

    public get levelCompleted() { return this.hasCompletedLevel; }
    public set levelCompleted(val: boolean) { this.hasCompletedLevel = val; }

    public get isJumping() { return this.isJumpingFromGround; }
    public set isJumping(val: boolean) { this.isJumpingFromGround = val; }
}