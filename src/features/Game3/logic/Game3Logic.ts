// src/features/Game3/logic/Game3Logic.ts
import { Game3MainSchema, Game3PlatformsSchema } from '../model/Game3LogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { Game3Commands } from './Game3Commands';
import { Game3Config } from '../model/Game3Config';
import { ParsedMapData, PlatformData } from './Game3MapData'; // Keep these imports
import { Game3Collision } from './Game3Collision';
import { Game3Hazards } from './Game3Hazards';

export class Game3Logic extends BaseLogic<Game3Config> {
    protected dispatcher: BaseDispatcher<Game3Logic>;

    private collision: Game3Collision;
    private hazards: Game3Hazards;

    // State
    public hp = 100;
    public hero = { x: 0, y: 0, vx: 0, vy: 0 };
    public isOnGround = false;
    public isWallSliding = false;
    public wallJumpTimer = 0;
    public wallJumpDirection = 0;
    public spikeDamageTimer = 0;
    public wasInSpike = false;
    public portalCooldown = 0;
    public isJumpingFromGround = false;
    public hasCompletedLevel = false;
    public spawnPoint = { x: 0, y: 0 };

    // Config
    public heroWidth = 1.0;
    public heroHeight = 1.0;
    public worldScale = 32;
    public playerScale = 1.0;
    public playerOffsetY = 0;
    public platforms: PlatformData[] = [];
    public mapData: ParsedMapData | null = null;

    // Movement settings
    private moveSpeed = 0.25;
    private jumpPower = -0.4;
    private gravity = 0.04;
    private friction = 0.5;

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
    }

    public setMapData(data: ParsedMapData) {
        this.mapData = data;
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

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config || !this.isInitialized) return;

        this.isOnGround = this.collision.checkIsOnGround();

        this.updateHeroMovement();
        this.collision.resolveMovement();

        this.hazards.updateExitLogic();
        this.hazards.updateSpikeLogic();
        this.hazards.updatePortalLogic();
        this.hazards.updateVoidLogic();


        this.syncToSAB(sharedView, frameCount, fps);
    }

    public isAction(action: string): boolean {
        return this.inputState && this.inputState.actions && this.inputState.actions.includes(action);
    }

    private updateHeroMovement() {
        const wallSide = this.collision.getWallCollision();
        const moveLeft = this.isAction('MOVE_LEFT');
        const moveRight = this.isAction('MOVE_RIGHT');
        const jumpHeld = this.isAction('JUMP');

        let moveDir = 0;
        if (moveLeft) moveDir -= 1;
        if (moveRight) moveDir += 1;

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

        this.isWallSliding = false;
        if (!this.isOnGround && wallSide !== 0) {
            if ((wallSide === -1 && moveDir === -1) || (wallSide === 1 && moveDir === 1)) {
                this.isWallSliding = true;
                this.wallJumpTimer = 0;
            }
        }

        let effectiveGravity = this.gravity;
        if (this.isJumpingFromGround && jumpHeld && this.hero.vy < 0) {
            effectiveGravity *= 0.5;
        }

        if (this.isWallSliding && this.hero.vy > 0) {
            this.hero.vy += effectiveGravity * 0.2;
            if (this.hero.vy > 0.1) this.hero.vy = 0.1;
        } else {
            this.hero.vy += effectiveGravity;
        }

        if (jumpHeld) {
            if (this.isOnGround) {
                this.hero.vy = this.jumpPower;
                this.wallJumpTimer = 0;
                this.isJumpingFromGround = true;
            } else if (wallSide !== 0) {
                this.hero.vy = this.jumpPower;
                this.wallJumpDirection = -wallSide;
                this.wallJumpTimer = 15;
                this.isWallSliding = false;
                this.isJumpingFromGround = false;
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
        sMain[M.WALL_JUMP_TIMER] = this.wallJumpTimer;
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