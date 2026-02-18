// src/features/Game3/logic/Game3Logic.ts
import { Game3LogicSchema } from '../model/Game3LogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { Game3Commands } from './Game3Commands';
import { Game3Config } from '../model/Game3Config';
import { ParsedMapData, PlatformData } from '../data/Game3MapData';
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

    // Logical Visual State
    public flipX = false;
    public animState = 0; // 0:Idle, 1:Walk, 2:Jump, 3:WallSlide

    // Config
    public heroWidth = 1.0;
    public heroHeight = 1.0;
    public worldScale = 32;
    public playerScale = 1.0;
    public playerOffsetY = 0;
    public platforms: PlatformData[] = [];
    public mapData: ParsedMapData | null = null;

    // Movement settings
    private moveSpeed = 0.2;
    private jumpPower = -0.4;
    private gravity = 0.04;
    private friction = 0.5;

    constructor() {
        super(Game3LogicSchema.REVISION);
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

        // We do NOT need to postMessage MAP_DATA_PRODUCED anymore for rendering,
        // because we are now syncing via SAB. We might still send it for UI logic if needed.
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config || !this.isInitialized) return;

        this.isOnGround = this.collision.checkIsOnGround();

        this.updateHeroMovement();
        this.collision.resolveMovement();
        this.determineAnimState(); // Replaces Game3Animation update
        this.hazards.updateExitLogic();
        this.hazards.updateSpikeLogic();
        this.hazards.updatePortalLogic();
        this.hazards.updateVoidLogic();

        this.syncToSAB(sharedView, frameCount, fps);
    }

    private isAction(action: string): boolean {
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

    private determineAnimState() {
        if (this.hero.vx > 0.01) this.flipX = false;
        else if (this.hero.vx < -0.01) this.flipX = true;

        if (this.isWallSliding) this.animState = 3;
        else if (!this.isOnGround) this.animState = 2;
        else if (Math.abs(this.hero.vx) > 0.01) this.animState = 1;
        else this.animState = 0;
    }

    private getPlatformType(p: PlatformData): number {
        // Encoding type for SAB
        if (p.isExit) return 5;
        if (p.isPortal) return 4;
        if (p.isSpike) return 3;
        if (p.isVoid) return 2;
        if (p.isWall) return 1;
        return 0; // Floor/Default
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

        sharedView[S.WORLD_SCALE] = this.worldScale;
        sharedView[S.PLAYER_SCALE] = this.playerScale;
        sharedView[S.PLAYER_OFFSET_Y] = this.playerOffsetY;

        // SYNC OBJECTS TO SAB
        // We limit to MAX_OBJECTS to prevent buffer overflow
        const objCount = Math.min(this.platforms.length, S.MAX_OBJECTS);
        sharedView[S.OBJ_COUNT] = objCount;

        for(let i = 0; i < objCount; i++) {
            const p = this.platforms[i];
            const idx = S.OBJ_START_INDEX + (i * S.OBJ_STRIDE);
            sharedView[idx] = p.x;
            sharedView[idx + 1] = p.y;
            sharedView[idx + 2] = p.width;
            sharedView[idx + 3] = p.height;
            sharedView[idx + 4] = this.getPlatformType(p);
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
            animState: this.animState,
            flipX: this.flipX
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
            this.animState = data.animState ?? 0;
            this.flipX = data.flipX ?? false;
            this.isInitialized = true;
        }
    }

    public modifyHP(amount: number) {
        this.hp = Math.max(0, Math.min(100, this.hp + amount));
    }
}