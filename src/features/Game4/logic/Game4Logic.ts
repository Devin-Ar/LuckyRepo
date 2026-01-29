// src/features/Game4/logic/Game4Logic.ts
import {Game4LogicSchema} from '../model/Game4LogicSchema';
import {BaseLogic} from '../../../core/templates/BaseLogic';
import {BaseDispatcher} from '../../../core/templates/BaseDispatcher';
import {Game4Commands} from './Game4Commands';
import {Game4Config} from '../model/Game4Config';
import {TerrainDataTopdown} from '../data/Terrain Data Topdown';

interface Rock {
    x: number;
    y: number;
    vx: number;
    vy: number;
    seed: number;
}

export class Game4Logic extends BaseLogic<Game4Config> {
    protected dispatcher: BaseDispatcher<Game4Logic>;
    private hero = {x: 0, y: 0, vx: 0, vy: 0, hp: 100};
    private rocks: Rock[] = [];
    private currentFrame: number = 0;
    private lastHitFrame: number = 0;
    private terrainData: TerrainDataTopdown = new TerrainDataTopdown();

    constructor() {
        super(Game4LogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game4Commands, "Game4");
    }

    public applyConfig(config: Game4Config): void {
        this.config = config;
        this.hero.hp = config.initialHP;
        this.hero.x = config.heroStartX;
        this.hero.y = config.heroStartY;

        if (this.rocks.length === 0) {
            for (let i = 0; i < config.spawnCount; i++) this.spawnRock();
        }
    }

    public setMovement(vx?: number, vy?: number): void {
        if (vx !== undefined) this.hero.vx = vx;
        if (vy !== undefined) this.hero.vy = vy;
    }

    public modifyHp(amount: number): void {
        this.hero.hp = Math.max(0, Math.min(100, this.hero.hp + amount));
        if (amount < 0) this.triggerHitCooldown();
    }

    public triggerHitCooldown(): void {
        this.lastHitFrame = this.currentFrame;
    }

    public override destroy(): void {
        super.destroy();
        this.rocks = [];
    }

    public override getSnapshot(): any {
        return {
            hero: {...this.hero},
            rocks: [...this.rocks],
            lastHitFrame: this.lastHitFrame,
            currentFrame: this.currentFrame,
            config: this.config
        };
    }

    public override loadSnapshot(data: any): void {
        if (!data) return;
        this.config = data.config;
        this.hero = data.hero;
        this.rocks = data.rocks;
        this.lastHitFrame = data.lastHitFrame;
        this.currentFrame = data.currentFrame ?? 0;
        this.isInitialized = true;
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config) return;
        this.currentFrame = frameCount;

        const keys = this.inputState.keys;
        const moveSpeed = this.config.moveSpeed;

        let targetVx = 0;
        let targetVy = 0;

        if (keys.includes('W') || keys.includes('ARROWUP')) targetVy = -moveSpeed;
        if (keys.includes('S') || keys.includes('ARROWDOWN')) targetVy = moveSpeed;
        if (keys.includes('A') || keys.includes('ARROWLEFT')) targetVx = -moveSpeed;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) targetVx = moveSpeed;

        this.setMovement(targetVx, targetVy);

        if (this.currentFrame - this.lastHitFrame > 120 && this.hero.hp < 100) {
            this.hero.hp = Math.min(100, this.hero.hp + (this.hero.hp < 25 ? 0.3 : 0.1));
        }

        const newX = this.hero.x + this.hero.vx;
        const newY = this.hero.y + this.hero.vy;

        const adjustedPos = this.terrainData.resolveMovement(
            this.hero.x, this.hero.y,
            newX, newY,
            32, 32
        );

        this.hero.x = Math.max(0, Math.min(this.config.width, adjustedPos.x));
        this.hero.y = Math.max(0, Math.min(this.config.height, adjustedPos.y));

        this.processRocks(frameCount);
        this.syncToSAB(sharedView, frameCount, fps);
    }

    private spawnRock(): void {
        if (!this.config || this.rocks.length >= Game4LogicSchema.MAX_ROCKS) return;
        this.rocks.push({
            x: Math.random() * this.config.width,
            y: Math.random() * this.config.height,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            seed: Math.random() * 1000
        });
    }

    private processRocks(frameCount: number): void {
        if (!this.config) return;
        for (let i = this.rocks.length - 1; i >= 0; i--) {
            const r = this.rocks[i];
            r.x += r.vx;
            r.y += r.vy;
            let hit = false;

            if (r.x <= 0 || r.x >= this.config.width) {
                r.vx *= -1;
                hit = true;
            }
            if (r.y <= 0 || r.y >= this.config.height) {
                r.vy *= -1;
                hit = true;
            }

            const dx = r.x - this.hero.x;
            const dy = r.y - this.hero.y;
            if (dx * dx + dy * dy < 1600) {
                r.vx *= -1.1;
                r.vy *= -1.1;
                this.modifyHp(-0.2);
                hit = true;
                self.postMessage({type: 'EVENT', name: 'EXPLOSION_REQ'});
            }
            if (hit && Math.random() > 0.8) this.spawnRock();
        }
    }

    private syncToSAB(sharedView: Float32Array, frameCount: number, fps: number): void {
        sharedView[Game4LogicSchema.HERO_HP] = this.hero.hp;
        sharedView[Game4LogicSchema.HERO_X] = this.hero.x;
        sharedView[Game4LogicSchema.HERO_Y] = this.hero.y;
        sharedView[Game4LogicSchema.ENTITY_COUNT] = this.rocks.length;

        this.rocks.forEach((r, i) => {
            const base = Game4LogicSchema.ROCKS_START_INDEX + (i * Game4LogicSchema.ROCK_STRIDE);
            sharedView[base] = r.x;
            sharedView[base + 1] = r.y;
            sharedView[base + 2] = r.seed;
        });
    }
}
