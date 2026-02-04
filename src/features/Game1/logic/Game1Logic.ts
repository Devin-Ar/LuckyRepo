// src/features/Game1/logic/Game1Logic.ts
import {Game1MainSchema, Game1RocksSchema} from '../model/Game1LogicSchema';
import {BaseLogic} from '../../../core/templates/BaseLogic';
import {BaseDispatcher} from '../../../core/templates/BaseDispatcher';
import {Game1Commands} from './Game1Commands';
import {Game1Config} from '../model/Game1Config';

interface Rock {
    x: number;
    y: number;
    vx: number;
    vy: number;
    seed: number;
}

export class Game1Logic extends BaseLogic<Game1Config> {
    protected dispatcher: BaseDispatcher<Game1Logic>;
    private hero = {x: 0, y: 0, vx: 0, vy: 0, hp: 100};
    private rocks: Rock[] = [];
    private currentFrame: number = 0;
    private lastHitFrame: number = 0;

    private wasMouseDown: boolean = false;

    constructor() {
        super(Game1MainSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game1Commands, "Game1");
    }

    public applyConfig(config: Game1Config): void {
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

        const actions = this.inputState.actions;
        const moveSpeed = this.config.moveSpeed;

        let targetVx = 0;
        let targetVy = 0;

        if (actions.includes('MOVE_UP')) targetVy = -moveSpeed;
        if (actions.includes('MOVE_DOWN')) targetVy = moveSpeed;
        if (actions.includes('MOVE_LEFT')) targetVx = -moveSpeed;
        if (actions.includes('MOVE_RIGHT')) targetVx = moveSpeed;

        this.setMovement(targetVx, targetVy);

        if (this.inputState.isMouseDown && !this.wasMouseDown) {
            const worldMouseX = this.inputState.mouseX * this.config.width;
            const worldMouseY = this.inputState.mouseY * this.config.height;

            this.spawnRock(worldMouseX, worldMouseY);
        }
        this.wasMouseDown = this.inputState.isMouseDown;

        if (this.currentFrame - this.lastHitFrame > 120 && this.hero.hp < 100) {
            this.hero.hp = Math.min(100, this.hero.hp + (this.hero.hp < 25 ? 0.3 : 0.1));
        }

        this.hero.x = Math.max(0, Math.min(this.config.width, this.hero.x + this.hero.vx));
        this.hero.y = Math.max(0, Math.min(this.config.height, this.hero.y + this.hero.vy));

        this.processRocks(frameCount);
        this.syncToSAB(sharedView, frameCount, fps);
    }

    private spawnRock(x?: number, y?: number): void {
        if (!this.config) return;

        const rocksView = this.sharedViews.get('rocks');
        if (!rocksView) return;

        const currentCapacity = Math.floor(rocksView.length / Game1RocksSchema.STRIDE);

        if (this.rocks.length >= currentCapacity) {
            const newSize = rocksView.length + (1000 * Game1RocksSchema.STRIDE); // Expand by ~1000 rocks

            if ((this as any)._resizeRequested !== newSize) {
                console.log(`[Game1Logic] Requesting Resize. Current: ${rocksView.length}, New: ${newSize}`);
                self.postMessage({
                    type: 'REQUEST_RESIZE',
                    payload: { bufferName: 'rocks', newSize: newSize }
                });
                (this as any)._resizeRequested = newSize;
            }
            return;
        }

        (this as any)._resizeRequested = 0;

        this.rocks.push({
            x: x ?? Math.random() * this.config.width,
            y: y ?? Math.random() * this.config.height,
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
        const mainView = this.sharedViews.get('main');
        const rocksView = this.sharedViews.get('rocks');

        if (mainView) {
            mainView[Game1MainSchema.HERO_HP] = this.hero.hp;
            mainView[Game1MainSchema.HERO_X] = this.hero.x;
            mainView[Game1MainSchema.HERO_Y] = this.hero.y;
            mainView[Game1MainSchema.ENTITY_COUNT] = this.rocks.length;
        }

        if (rocksView) {
            this.rocks.forEach((r, i) => {
                const base = i * Game1RocksSchema.STRIDE;
                if (base + 2 < rocksView.length) {
                    rocksView[base] = r.x;
                    rocksView[base + 1] = r.y;
                    rocksView[base + 2] = r.seed;
                }
            });
        }
    }
}