// src/features/Game2/logic/Game2Logic.ts
import {Game2LogicSchema} from '../model/Game2LogicSchema';
import {BaseLogic} from '../../../core/templates/BaseLogic';
import {BaseDispatcher} from '../../../core/templates/BaseDispatcher';
import {Game2Commands} from './Game2Commands';
import {Game2Config} from '../model/Game2Config';
import {TerrainDataPlatformer} from '../../Game3/data/Terrain Data Platformer';

export class Game2Logic extends BaseLogic<Game2Config> {
    protected dispatcher: BaseDispatcher<Game2Logic>;
    private hp = 100;
    private energy = 50;
    private scrap = 0;
    private currentFrame = 0;
    private hero = { x: 100, y: 100, vx: 0, vy: 0 };
    private terrainData: TerrainDataPlatformer = new TerrainDataPlatformer();

    constructor() {
        super(Game2LogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game2Commands, "Game2");
    }

    public applyConfig(config: Game2Config): void {
        this.config = config;
        this.hp = config.initialHP;
        this.energy = config.initialEnergy;
        this.scrap = config.initialScrap;
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
        const moveSpeed = 4;
        const gravity = 0.5;
        const jumpForce = -10;

        // Horizontal movement
        this.hero.vx = 0;
        if (keys.includes('A') || keys.includes('ARROWLEFT')) this.hero.vx = -moveSpeed;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) this.hero.vx = moveSpeed;

        const newHeroX = this.hero.x + this.hero.vx;
        const horizontalResolution = this.terrainData.resolveHorizontalMovement(
            this.hero.x, newHeroX, this.hero.y, 32, 64
        );
        this.hero.x = horizontalResolution.x;

        // Vertical movement (Gravity)
        this.hero.vy += gravity;
        const newHeroY = this.hero.y + this.hero.vy;

        const verticalResolution = this.terrainData.resolveVerticalMovement(
            this.hero.x, this.hero.y, newHeroY, 32, 64
        );

        this.hero.y = verticalResolution.y;
        if (verticalResolution.collided) {
            this.hero.vy = 0;
        }

        // Jump
        if ((keys.includes('W') || keys.includes('ARROWUP') || keys.includes(' ')) && verticalResolution.collided) {
            this.hero.vy = jumpForce;
        }

        if (frameCount % this.config.regenRate === 0 && this.energy < this.config.maxEnergy) {
            this.modifyEnergy(1);
        }

        sharedView[Game2LogicSchema.HERO_HP] = this.hp;
        sharedView[Game2LogicSchema.ENERGY] = this.energy;
        sharedView[Game2LogicSchema.SCRAP_COUNT] = this.scrap;
        sharedView[Game2LogicSchema.TICK_COUNT] = frameCount;
    }
}