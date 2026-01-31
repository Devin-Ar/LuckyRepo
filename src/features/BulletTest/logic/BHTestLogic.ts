// src/features/Game1/logic/Game1Logic.ts
import {BHLogicSchema} from '../model/BHLogicSchema';
import {BaseLogic} from '../../../core/templates/BaseLogic';
import {BaseDispatcher} from '../../../core/templates/BaseDispatcher';
import {BHCommands} from './BHCommands';
import {BHConfig} from '../model/BHConfig';

interface Rock {
    x: number;
    y: number;
    vx: number;
    vy: number;
    timeElapsed: number;
    seed: number;
    atkBox: {sX: number, sY: number, eX: number, eY: number},
    followRun: boolean;
    primedMode: boolean;
}

export class BHTestLogic extends BaseLogic<BHConfig> {
    protected dispatcher: BaseDispatcher<BHTestLogic>;
    private hero = {x: 0, y: 0, vx: 0, vy: 0, hp: 100};
    private rocks: Rock[] = [];
    private currentFrame: number = 0;
    private lastHitFrame: number = 0;

    constructor() {
        super(BHLogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, BHCommands, "BHTest");
    }

    public applyConfig(config: BHConfig): void {
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

        this.hero.x = Math.max(0, Math.min(this.config.width, this.hero.x + this.hero.vx));
        this.hero.y = Math.max(0, Math.min(this.config.height, this.hero.y + this.hero.vy));

        this.processRocks(frameCount);
        this.processRockAttacks(frameCount);
        this.syncToSAB(sharedView, frameCount, fps);
    }

    private spawnRock(): void {
        if (!this.config || this.rocks.length >= BHLogicSchema.MAX_ROCKS) return;
        this.rocks.push({
            x: Math.random() * this.config.width,
            y: .1 * this.config.height,
            vx: 0,
            vy: 0,
            timeElapsed: Date.now() + Math.random() * 1000,
            seed: Math.random() * 1000,
            atkBox: {sX: 0, sY: 0, eX: 0, eY: 0},
            followRun: false,
            primedMode: false
        });
    }

    private processRocks(frameCount: number): void {
        if (!this.config) return;
        for (let i = this.rocks.length - 1; i >= 0; i--) {
            const r = this.rocks[i];
            if (r.primedMode) continue;
            const dx = r.x - this.hero.x;
            const dy = r.y - this.hero.y;
            const distance = dx * dx + dy * dy;
            const sqDistance = Math.sqrt(dx * dx + dy * dy);

            if (r.followRun) {
                r.vx *= 0;
                r.vy *= 0;
            } else {
                r.vx = this.getSnapshot().config.moveSpeed - 1;
                r.vy = this.getSnapshot().config.moveSpeed - 1;
                if (sqDistance > 200) {
                    r.vx *= dx > 0 ? -1 : 1;
                    r.vy *= dy > 0 ? -1 : 1;
                }

                if (sqDistance < 250) {
                    r.vx *= dx > 0 ? 1 : -1;
                    r.vy *= dy > 0 ? 1 : -1;
                }
            }

            r.vx = r.x <= 0 ? 1 : r.vx;
            r.vx = r.x >= this.config.width ? -1 : r.vx;

            r.vy = r.y <= 0 ? 1 : r.vy;
            r.vy = r.y >= this.config.height ? -1 : r.vy;

            r.x += r.vx;
            r.y += r.vy;

            //100 and 250 are placeholders for range entity need to stay in
            r.followRun = sqDistance > 200 && sqDistance < 250;

            if (distance < 1600) {
                r.vx *= -1.1;
                r.vy *= -1.1;
                this.modifyHp(-0.2);
                self.postMessage({type: 'EVENT', name: 'EXPLOSION_REQ'});
            }
        }
    }

    private processRockAttacks(frameCount: number): void {
        if (!this.config) return;
        for (let i = this.rocks.length - 1; i >= 0; i--) {
            const r = this.rocks[i];
            const timeMili = (Date.now() - r.timeElapsed);
            if (timeMili > 5000 && !r.primedMode) {
                r.primedMode = true;
                r.atkBox = {sX: r.x, sY: r.y, eX: this.hero.x, eY: this.hero.y};
            }

            if (r.primedMode && timeMili > 7000 ) {
                const slope = (r.atkBox.eY - r.atkBox.sY) / (r.atkBox.eX - r.atkBox.sX);
                const regnum = r.atkBox.sY - (slope*r.atkBox.sX);
                const top = Math.abs(slope*this.hero.x + -1*this.hero.y + regnum);
                const bot = Math.sqrt(slope*slope + 1);
                const distanceLines = top/bot;

                if (distanceLines < 30) {
                    this.modifyHp(-10);
                }
                r.timeElapsed = Date.now();
                r.primedMode = false;
                r.atkBox = {sX: 0, sY: 0, eX: 0, eY: 0};
            }

        }
    }

    private syncToSAB(sharedView: Float32Array, frameCount: number, fps: number): void {
        sharedView[BHLogicSchema.HERO_HP] = this.hero.hp;
        sharedView[BHLogicSchema.HERO_X] = this.hero.x;
        sharedView[BHLogicSchema.HERO_Y] = this.hero.y;
        sharedView[BHLogicSchema.ENTITY_COUNT] = this.rocks.length;

        this.rocks.forEach((r, i) => {
            const base = BHLogicSchema.ROCKS_START_INDEX + (i * BHLogicSchema.ROCK_STRIDE);
            sharedView[base] = r.x;
            sharedView[base + 1] = r.y;
            sharedView[base + 2] = r.seed;
            sharedView[base + 3] = r.primedMode ? 1 : 0;
            sharedView[base + 4] = r.atkBox.sX;
            sharedView[base + 5] = r.atkBox.sY;
            sharedView[base + 6] = r.atkBox.eX;
            sharedView[base + 7] = r.atkBox.eY;
        });
    }
}