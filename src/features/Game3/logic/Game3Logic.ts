// src/features/Game3/logic/Game3Logic.ts
import {Game3LogicSchema} from '../model/Game3LogicSchema';
import {BaseLogic} from '../../../core/templates/BaseLogic';
import {BaseDispatcher} from '../../../core/templates/BaseDispatcher';
import {Game3Commands} from './Game3Commands';
import {Game3Config} from '../model/Game3Config';
import {TerrainDataPlatformer} from '../data/Terrain Data Platformer';
import {Map_Generation} from '../model/Map_Generation';
import {HeroAssetManager} from './HeroAssetManager';
import {HeroMovement} from './HeroMovement';
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
        if (heroData && heroData.hero) {
            const h = heroData.hero;
            this.heroWidth = h.width || 3;
            this.heroHeight = h.height || 3;
            this.hp = h.health || 100;
            this.heroMovement.configure({
                speed: h.speed,
                jumpSpeed: h.jumpSpeed,
                gravity: h.gravity
            });
            console.log(`[Game3Logic] Hero params initialized from data: ${this.heroWidth}x${this.heroHeight}`);
        }
    }

    public applyConfig(config: Game3Config): void {
        this.config = config;
        this.hp = config.initialHP;
        this.energy = config.initialEnergy;
        this.scrap = config.initialScrap;

        if (config.mapPath) {
            this.loadMap(config.mapPath);
        }
    }

    public async loadMap(mapPath: string): Promise<void> {
        try {
            // Build a full URL for Jimp.read to ensure it works in Web Worker
            const fullUrl = new URL(mapPath, self.location.origin).href;
            console.log(`[Game3Logic] Loading map from: ${fullUrl}`);
            
            const parsedMap = await Map_Generation.generateLevel(fullUrl);
            this.terrainData = new TerrainDataPlatformer(parsedMap.platforms);
            this.hero.x = parsedMap.playerStart.x;
            this.hero.y = parsedMap.playerStart.y;
            this.hero.vx = 0;
            this.hero.vy = 0;
            this.exitDoor = parsedMap.exit || null;
            console.log(`[Game3Logic] Map loaded. Platforms: ${parsedMap.platforms.length}, Hero Start: (${this.hero.x}, ${this.hero.y})`);
            
            // Send map data to the view
            self.postMessage({type: 'EVENT', name: 'MAP_LOADED', payload: parsedMap});
        } catch (error) {
            console.error(`[Game3Logic] Failed to load map from ${mapPath}:`, error);
        }
    }

    public modifyHp(amount: number) {
        this.hp = Math.max(0, this.hp + amount);
    }

    public modifyEnergy(amount: number) {
        if (!this.config) return;
        this.energy = Math.max(0, this.energy + amount);
    }

    public addScrap(amount: number = 1) {
        this.scrap += amount;
    }

    public override destroy(): void {
        super.destroy();
        this.hp = 100;
        this.energy = 50;
        this.scrap = 0;
    }

    public override getSnapshot(): any {
        return {
            hp: this.hp, energy: this.energy, scrap: this.scrap,
            currentFrame: this.currentFrame, config: this.config
        };
    }

    public override loadSnapshot(data: any): void {
        if (!data) return;
        this.config = data.config;
        this.hp = data.hp ?? 100;
        this.energy = data.energy ?? 50;
        this.scrap = data.scrap ?? 0;
        this.isInitialized = true;
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config) return;
        this.currentFrame = frameCount;

        const keys = this.inputState.keys;
        const isOnGround = this.terrainData.isOnPlatform(this.hero.x, this.hero.y, this.heroWidth, this.heroHeight);

        // Movement physics (Horizontal + Vertical + Jump)
        this.heroMovement.update(this.hero, keys, isOnGround);

        // Resolve Horizontal Collision
        const newHeroX = this.hero.x + this.hero.vx;
        const horizontalResolution = this.terrainData.resolveHorizontalMovement(
            this.hero.x, newHeroX, this.hero.y, this.heroWidth, this.heroHeight
        );
        this.hero.x = horizontalResolution.x;
        if (horizontalResolution.collided) {
            this.hero.vx = 0; // Stop horizontal momentum on wall hit
        }

        // Resolve Vertical Collision
        const newHeroY = this.hero.y + this.hero.vy;
        const verticalResolution = this.terrainData.resolveVerticalMovement(
            this.hero.x, this.hero.y, newHeroY, this.heroWidth, this.heroHeight
        );

        this.hero.y = verticalResolution.y;
        if (verticalResolution.collided) {
            this.hero.vy = 0; // Stop vertical momentum on floor/ceiling hit
        }

        // Check Exit Door Interaction
        if (this.exitDoor) {
            if (
                this.hero.x < this.exitDoor.x + this.exitDoor.width &&
                this.hero.x + this.heroWidth > this.exitDoor.x &&
                this.hero.y < this.exitDoor.y + this.exitDoor.height &&
                this.hero.y + this.heroHeight > this.exitDoor.y
            ) {
                console.log(`[Game3Logic] Exit reached at frame ${frameCount}!`);
                // Future: trigger level win event
            }
        }

        if (frameCount % this.config.regenRate === 0 && this.energy < this.config.maxEnergy) {
            this.modifyEnergy(1);
        }

        // Re-check onGround after resolution for animation accuracy
        const finalOnGround = this.terrainData.isOnPlatform(this.hero.x, this.hero.y, this.heroWidth, this.heroHeight);
        const animUpdate = this.heroAssetManager.update(this.hero.vx, this.hero.vy, finalOnGround);

        sharedView[Game3LogicSchema.HERO_HP] = this.hp;
        sharedView[Game3LogicSchema.HERO_X] = this.hero.x;
        sharedView[Game3LogicSchema.HERO_Y] = this.hero.y;
        sharedView[Game3LogicSchema.ENERGY] = this.energy;
        sharedView[Game3LogicSchema.SCRAP_COUNT] = this.scrap;
        sharedView[Game3LogicSchema.TICK_COUNT] = frameCount;
        sharedView[Game3LogicSchema.HERO_ANIM_FRAME] = animUpdate.frame;
        sharedView[Game3LogicSchema.HERO_FLIP] = animUpdate.flipX ? 1 : 0;
        sharedView[Game3LogicSchema.HERO_ANIM_STATE] = animUpdate.assetKey === 'hero_walk' ? 1 : 0;
        sharedView[Game3LogicSchema.HERO_WIDTH] = this.heroWidth;
        sharedView[Game3LogicSchema.HERO_HEIGHT] = this.heroHeight;
    }
}
