// src/features/Game3/logic/Game3Logic.ts
import { Game3LogicSchema } from '../model/Game3LogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { Game3Commands } from './Game3Commands';
import { Game3Config } from '../model/Game3Config';
import { TerrainDataPlatformer } from '../data/TerrainDataPlatformer';
import { HeroAssetManager } from './HeroAssetManager';
import { HeroMovement } from './HeroMovement';
import { ParsedMapData } from '../data/Game3MapData';
import heroData from '../data/hero_data.json';

export class Game3Logic extends BaseLogic<Game3Config> {
    protected dispatcher: BaseDispatcher<Game3Logic>;
    private hp = 100;
    private energy = 50;
    private scrap = 0;
    private currentFrame = 0;

    private hero = { x: 100, y: 100, vx: 0, vy: 0 };
    private heroWidth = 32;
    private heroHeight = 64;
    private terrainData: TerrainDataPlatformer = new TerrainDataPlatformer();
    private heroAssetManager: HeroAssetManager = new HeroAssetManager();
    private heroMovement: HeroMovement = new HeroMovement();
    private exitDoor: { x: number, y: number, width: number, height: number } | null = null;

    constructor() {
        super(Game3LogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game3Commands, "Game3");
        this.initializeHeroParams();
    }

    private initializeHeroParams() {
        if (heroData?.hero) {
            const h = heroData.hero;
            this.heroWidth = h.width || 32;
            this.heroHeight = h.height || 64;
            this.hp = h.health || 100;
            this.heroMovement.configure({
                speed: h.speed || 4.5,
                jumpSpeed: h.jumpSpeed || 9.0,
                gravity: h.gravity || 0.4
            });
        }
    }

    public applyConfig(config: Game3Config): void {
        this.config = config;
        this.hp = config.initialHP;
        this.energy = config.initialEnergy;
        this.scrap = config.initialScrap;
    }

    public setMapData(data: ParsedMapData) {
        this.terrainData = new TerrainDataPlatformer(data.platforms);
        this.hero.x = data.playerStart.x;
        this.hero.y = data.playerStart.y - this.heroHeight;
        this.hero.vx = 0;
        this.hero.vy = 0;
        this.exitDoor = data.exit || null;
        this.isInitialized = true;
    }

    public modifyHp(amount: number) { this.hp = Math.max(0, this.hp + amount); }
    public modifyEnergy(amount: number) { this.energy = Math.max(0, this.energy + amount); }
    public addScrap(amount: number) { this.scrap += amount; }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number): void {
        if (!this.config || !this.isInitialized) return;
        this.currentFrame = frameCount;

        // Standardize keys to uppercase to match Game1 style for reliability
        const keys = this.inputState.keys.map(k => k.toUpperCase());

        const isOnGround = this.terrainData.isOnPlatform(this.hero.x, this.hero.y, this.heroWidth, this.heroHeight);

        // 1. Calculate Velocity based on Input
        this.heroMovement.update(this.hero, keys, isOnGround);

        // 2. Resolve Horizontal Movement
        const nextX = this.hero.x + this.hero.vx;
        const hRes = this.terrainData.resolveHorizontalMovement(this.hero.x, nextX, this.hero.y, this.heroWidth, this.heroHeight);
        this.hero.x = hRes.x;
        if (hRes.collided) this.hero.vx = 0;

        // 3. Resolve Vertical Movement
        const nextY = this.hero.y + this.hero.vy;
        const vRes = this.terrainData.resolveVerticalMovement(this.hero.x, this.hero.y, nextY, this.heroWidth, this.heroHeight);
        this.hero.y = vRes.y;
        if (vRes.collided) {
            this.hero.vy = 0;
        }

        // 4. Sync Animation & SAB
        const anim = this.heroAssetManager.update(this.hero.vx, this.hero.vy, isOnGround);
        this.syncToSAB(sharedView, anim, isOnGround);
    }

    private syncToSAB(sharedView: Float32Array, anim: any, isOnGround: boolean) {
        sharedView[Game3LogicSchema.HERO_HP] = this.hp;
        sharedView[Game3LogicSchema.HERO_X] = this.hero.x;
        sharedView[Game3LogicSchema.HERO_Y] = this.hero.y;
        sharedView[Game3LogicSchema.ENERGY] = this.energy;
        sharedView[Game3LogicSchema.SCRAP_COUNT] = this.scrap;
        sharedView[Game3LogicSchema.HERO_ANIM_FRAME] = anim.frame;
        sharedView[Game3LogicSchema.HERO_FLIP] = anim.flipX ? 1 : 0;
        sharedView[Game3LogicSchema.HERO_WIDTH] = this.heroWidth;
        sharedView[Game3LogicSchema.HERO_HEIGHT] = this.heroHeight;

        const isMoving = Math.abs(this.hero.vx) > 0.1;
        sharedView[Game3LogicSchema.HERO_ANIM_STATE] = !isOnGround ? 2 : (isMoving ? 1 : 0);
    }

    public override getSnapshot() { return { hero: {...this.hero}, hp: this.hp, energy: this.energy, scrap: this.scrap }; }
    public override loadSnapshot(data: any) { if (data) { this.hero = data.hero; this.hp = data.hp; this.isInitialized = true; } }
}