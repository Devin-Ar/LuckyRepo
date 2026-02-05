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
        this.hero.vx = 0;
        this.hero.vy = 0;

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

        // 4. SAB Sync
        this.syncToSAB(sharedView, frameCount, fps);
    }

    private checkIsOnGround(): boolean {
        // Check slightly below the hero's feet (1 pixel down)
        const checkY = this.hero.y + this.heroHeight + 0.1;
        for (const p of this.platforms) {
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

    private updateHeroMovement(keys: string[]) {
        if (!keys) return;

        // 1. Horizontal Movement
        let moveDir = 0;
        if (keys.includes('A') || keys.includes('ARROWLEFT')) moveDir -= 1;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) moveDir += 1;

        if (moveDir !== 0) {
            this.hero.vx = moveDir * this.moveSpeed;
        } else {
            this.hero.vx *= this.friction;
            if (Math.abs(this.hero.vx) < 0.01) this.hero.vx = 0;
        }

        // 2. Vertical Movement (Gravity)
        this.hero.vy += this.gravity;

        // 3. Jump Logic
        const isJumping = keys.includes(' ') || keys.includes('W') || keys.includes('ARROWUP');
        if (this.isOnGround && isJumping) {
            this.hero.vy = this.jumpPower;
        }

        // 4. Terminal Velocity
        if (this.hero.vy > 0.8) this.hero.vy = 0.8;
    }

    private resolveMovement() {
        const nextX = this.hero.x + this.hero.vx;
        
        // Horizontal Resolution
        for (const p of this.platforms) {
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
            if (this.hero.x + this.heroWidth > p.x && this.hero.x < p.x + p.width && nextY + this.heroHeight > p.y && nextY < p.y + p.height) {
                if (nextY > this.hero.y) this.hero.y = p.y - this.heroHeight; // Land
                else if (nextY < this.hero.y) this.hero.y = p.y + p.height; // Ceiling
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
        if (!this.isOnGround) this.animState = 2;
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
        return { hero: { ...this.hero }, hp: this.hp };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.hero = data.hero || this.hero;
            this.hp = data.hp ?? this.hp;
            this.isInitialized = true;
        }
    }

    public modifyHP(amount: number) {
        this.hp = Math.max(0, Math.min(100, this.hp + amount));
    }
}
