// src/features/Game3/logic/Game3Logic.ts
import { Game3LogicSchema } from '../model/Game3LogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { Game3Commands } from './Game3Commands';
import { Game3Config } from '../model/Game3Config';
import { ParsedMapData, PlatformData } from '../data/Game3MapData';

export class Game3Logic extends BaseLogic<Game3Config> {
    protected dispatcher: BaseDispatcher<Game3Logic>;

    // State
    private hp = 100;
    private hero = { x: 0, y: 0, vx: 0, vy: 0 };
    private isOnGround = false;
    private isWallSliding = false;
    private wallJumpTimer = 0;
    private wallJumpDirection = 0; // -1 for left, 1 for right
    private spikeDamageTimer = 0;
    private wasInSpike = false;
    private portalCooldown = 0;
    private isJumpingFromGround = false;
    private hasCompletedLevel = false;
    private spawnPoint = { x: 0, y: 0 };

    // Visuals/Animation
    private animFrame = 0;
    private animTimer = 0;
    private flipX = false;
    private animState = 0; // 0: Idle, 1: Walk, 2: Jump

    // Config (Cache for SAB sync)
    private heroWidth = 1.0;
    private heroHeight = 1.0;
    private worldScale = 32;
    private playerScale = 1.0;
    private playerOffsetY = 0;
    private platforms: PlatformData[] = [];

    // Movement settings
    private moveSpeed = 0.2;
    private jumpPower = -0.4;
    private gravity = 0.04;
    private friction = 0.5;

    constructor() {
        super(Game3LogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game3Commands, "Game3");
    }

    public applyConfig(config: Game3Config): void {
        this.config = config;
        this.hp = config.initialHP;
        this.worldScale = config.worldScale || 32;
        this.playerScale = config.playerScale || 1.0;
        this.playerOffsetY = config.playerOffsetY || 0;
        this.heroWidth = config.heroWidth || 1.0;
        this.heroHeight = config.heroHeight || 2.0;

        // Configure movement
        this.moveSpeed = 0.2;
        this.jumpPower = -0.4;
        this.gravity = 0.04;
    }

    public setMapData(data: ParsedMapData) {
        this.platforms = data.platforms;
        this.hero.x = data.playerStart.x;
        this.hero.y = data.playerStart.y;
        this.spawnPoint = { x: data.playerStart.x, y: data.playerStart.y };
        this.hero.vx = 0;
        this.hero.vy = 0;
        this.hasCompletedLevel = false;

        // If the map marker has dimensions, use them
        if (data.playerStart.width && data.playerStart.height) {
            this.heroWidth = data.playerStart.width;
            this.heroHeight = data.playerStart.height;
        }
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config || !this.isInitialized) return;

        const keys = this.inputState.keys.map(k => k.toUpperCase());
        this.isOnGround = this.checkIsOnGround();

        // 1. Movement
        this.updateHeroMovement(keys);

        // 2. Physics Resolution
        this.resolveMovement();

        // 3. Animation State
        this.updateAnimation();

        // 4. Exit Logic (Check before other hazards to avoid being teleported away first)
        this.updateExitLogic();

        // 5. Spike Logic
        this.updateSpikeLogic();

        // 6. Portal Logic
        this.updatePortalLogic();

        // 7. Void Logic
        this.updateVoidLogic();

        // 8. SAB Sync
        this.syncToSAB(sharedView, frameCount, fps);
    }

    private checkIsOnGround(): boolean {
        // Check slightly below the hero's feet (0.1 units down)
        const checkY = this.hero.y + this.heroHeight + 0.1;
        for (const p of this.platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue; // Non-solid ground
            if (
                this.hero.x + this.heroWidth > p.x &&
                this.hero.x < p.x + p.width &&
                checkY > p.y &&
                this.hero.y + this.heroHeight <= p.y
            ) {
                return true;
            }
        }
        return false;
    }

    private getWallCollision(): number {
        const checkDist = 0.1;
        // Check Left (Wall is on our left)
        for (const p of this.platforms) {
            if (p.isWall &&
                this.hero.x <= p.x + p.width && this.hero.x + checkDist > p.x + p.width &&
                this.hero.y + this.heroHeight > p.y && this.hero.y < p.y + p.height) {
                return -1;
            }
        }
        // Check Right (Wall is on our right)
        for (const p of this.platforms) {
            if (p.isWall &&
                this.hero.x + this.heroWidth >= p.x && this.hero.x + this.heroWidth - checkDist < p.x &&
                this.hero.y + this.heroHeight > p.y && this.hero.y < p.y + p.height) {
                return 1;
            }
        }
        return 0;
    }

    private updateHeroMovement(keys: string[]) {
        if (!keys) return;

        const wallSide = this.getWallCollision();

        // 1. Horizontal Movement
        let moveDir = 0;
        if (keys.includes('A') || keys.includes('ARROWLEFT')) moveDir -= 1;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) moveDir += 1;

        if (this.wallJumpTimer > 0) {
            this.hero.vx = this.wallJumpDirection * this.moveSpeed * 1.5;
            this.wallJumpTimer--;
            // If we hit a wall while jumping away, we might want to allow sliding/jumping again immediately
            if (wallSide !== 0 && wallSide === this.wallJumpDirection) {
                // We hit the wall we were jumping towards? (e.g. opposite wall)
                // The requirements say we can choose to press space again or slide.
                // So we should allow wallSide to override if player wants.
            }
        } else {
            if (moveDir !== 0) {
                this.hero.vx = moveDir * this.moveSpeed;
            } else {
                this.hero.vx *= this.friction;
                if (Math.abs(this.hero.vx) < 0.01) this.hero.vx = 0;
            }
        }

        // 2. Wall Sliding
        this.isWallSliding = false;
        if (!this.isOnGround && wallSide !== 0) {
            // Slide if moving towards the wall
            if ((wallSide === -1 && moveDir === -1) || (wallSide === 1 && moveDir === 1)) {
                this.isWallSliding = true;
                this.wallJumpTimer = 0; // Cancel wall jump if we start sliding
            }
        }

        // 3. Vertical Movement (Gravity)
        const isJumping = keys.includes(' ') || keys.includes('W') || keys.includes('ARROWUP');
        const isSpace = keys.includes(' ');

        let effectiveGravity = this.gravity;
        if (this.isJumpingFromGround && isJumping && this.hero.vy < 0) {
            effectiveGravity *= 0.5; // Half gravity to double the jump height
        }

        if (this.isWallSliding && this.hero.vy > 0) {
            this.hero.vy += effectiveGravity * 0.2; // Reduced gravity
            if (this.hero.vy > 0.1) this.hero.vy = 0.1;
        } else {
            this.hero.vy += effectiveGravity;
        }

        // 4. Jump Logic
        if (isJumping) {
            if (this.isOnGround) {
                this.hero.vy = this.jumpPower;
                this.wallJumpTimer = 0;
                this.isJumpingFromGround = true;
            } else if (wallSide !== 0 && (isSpace || this.isWallSliding)) {
                // Wall Jump
                this.hero.vy = this.jumpPower;
                this.wallJumpDirection = -wallSide;
                this.wallJumpTimer = 15;
                this.isWallSliding = false;
                this.isJumpingFromGround = false; // No dynamic jump height from walls
            }
        }

        if (this.hero.vy >= 0) {
            this.isJumpingFromGround = false;
        }

        // 5. Terminal Velocity
        if (this.hero.vy > 0.8) this.hero.vy = 0.8;
    }

    private updateSpikeLogic() {
        const currentlyInSpike = this.checkHazardCollision('isSpike');
        if (currentlyInSpike) {
            if (!this.wasInSpike || this.spikeDamageTimer <= 0) {
                this.modifyHP(-10);
                this.spikeDamageTimer = 120; // ~2 seconds at 60fps
            }
        }
        
        if (this.spikeDamageTimer > 0) {
            this.spikeDamageTimer--;
        }
        this.wasInSpike = currentlyInSpike;
    }

    private updatePortalLogic() {
        if (this.portalCooldown > 0) {
            this.portalCooldown--;
            return;
        }

        const portal = this.getCollidingPlatform('isPortal');
        if (portal) {
            // Find the other portal
            const portals = this.platforms.filter(p => p.isPortal);
            if (portals.length >= 2) {
                const otherPortal = portals.find(p => p !== portal);
                if (otherPortal) {
                    // Teleport to center of the other portal
                    this.hero.x = otherPortal.x + (otherPortal.width / 2) - (this.heroWidth / 2);
                    this.hero.y = otherPortal.y + (otherPortal.height / 2) - (this.heroHeight / 2);
                    this.portalCooldown = 60; // 1 second cooldown
                }
            }
        }
    }

    private updateVoidLogic() {
        if (this.checkHazardCollision('isVoid')) {
            this.hero.x = this.spawnPoint.x;
            this.hero.y = this.spawnPoint.y;
            this.hero.vx = 0;
            this.hero.vy = 0;
            this.modifyHP(-20);
        }
    }

    private updateExitLogic() {
        if (!this.hasCompletedLevel && this.checkHazardCollision('isExit')) {
            this.hasCompletedLevel = true;
            this.dispatcher.dispatch('LEVEL_COMPLETE', {});
        }
    }

    private checkHazardCollision(property: 'isSpike' | 'isVoid' | 'isPortal' | 'isExit'): boolean {
        return !!this.getCollidingPlatform(property);
    }

    private getCollidingPlatform(property: 'isSpike' | 'isVoid' | 'isPortal' | 'isExit'): PlatformData | undefined {
        const padding = 0.05;
        for (const p of this.platforms) {
            if (p[property] &&
                this.hero.x + this.heroWidth - padding > p.x &&
                this.hero.x + padding < p.x + p.width &&
                this.hero.y + this.heroHeight - padding > p.y &&
                this.hero.y + padding < p.y + p.height) {
                return p;
            }
        }
        return undefined;
    }

    private resolveMovement() {
        const nextX = this.hero.x + this.hero.vx;
        
        // Horizontal Resolution
        for (const p of this.platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue; // Non-solid hazards
            if (nextX + this.heroWidth > p.x && nextX < p.x + p.width && this.hero.y + this.heroHeight > p.y && this.hero.y < p.y + p.height) {
                if (nextX > this.hero.x) this.hero.x = p.x - this.heroWidth;
                else if (nextX < this.hero.x) this.hero.x = p.x + p.width;
                this.hero.vx = 0;
                break;
            }
        }
        if (this.hero.vx !== 0) this.hero.x = nextX;

        const nextY = this.hero.y + this.hero.vy;
        // Vertical Resolution
        let verticalCollided = false;
        for (const p of this.platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue; // Non-solid hazards
            if (this.hero.x + this.heroWidth > p.x && this.hero.x < p.x + p.width && nextY + this.heroHeight > p.y && nextY < p.y + p.height) {
                if (nextY > this.hero.y) {
                    this.hero.y = p.y - this.heroHeight; // Land
                    this.isJumpingFromGround = false;
                } else if (nextY < this.hero.y) {
                    this.hero.y = p.y + p.height; // Ceiling
                    this.isJumpingFromGround = false;
                }
                this.hero.vy = 0;
                verticalCollided = true;
                break;
            }
        }
        if (!verticalCollided) this.hero.y = nextY;
    }

    private updateAnimation() {
        if (this.hero.vx > 0.01) this.flipX = false;
        else if (this.hero.vx < -0.01) this.flipX = true;

        const prevState = this.animState;
        if (this.isWallSliding) this.animState = 3;
        else if (!this.isOnGround) this.animState = 2;
        else if (Math.abs(this.hero.vx) > 0.01) this.animState = 1;
        else this.animState = 0;

        if (prevState !== this.animState) {
            this.animFrame = 0;
            this.animTimer = 0;
        }

        this.animTimer++;
        if (this.animTimer >= 6) {
            this.animFrame = (this.animFrame + 1) % 12;
            this.animTimer = 0;
        }
    }

    private syncToSAB(sharedView: Float32Array, frameCount: number, fps: number) {
        const S = Game3LogicSchema;
        sharedView[S.FRAME_COUNT] = frameCount;
        sharedView[S.FPS] = fps;

        sharedView[S.HERO_X] = this.hero.x;
        sharedView[S.HERO_Y] = this.hero.y;
        sharedView[S.HERO_VX] = this.hero.vx;
        sharedView[S.HERO_VY] = this.hero.vy;
        sharedView[S.HERO_HP] = this.hp;

        sharedView[S.HERO_WIDTH] = this.heroWidth;
        sharedView[S.HERO_HEIGHT] = this.heroHeight;
        sharedView[S.HERO_FLIP] = this.flipX ? 1 : 0;
        sharedView[S.HERO_ANIM_STATE] = this.animState;
        sharedView[S.HERO_ANIM_FRAME] = this.animFrame;

        sharedView[S.WORLD_SCALE] = this.worldScale;
        sharedView[S.PLAYER_SCALE] = this.playerScale;
        sharedView[S.PLAYER_OFFSET_Y] = this.playerOffsetY;
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
            hasCompletedLevel: this.hasCompletedLevel
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
            this.isInitialized = true;
        }
    }

    public modifyHP(amount: number) {
        this.hp = Math.max(0, Math.min(100, this.hp + amount));
    }
}
