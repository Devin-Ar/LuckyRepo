// src/features/Game4/logic/Game4Logic.ts

import { Game4LogicSchema, EnemyTypeIds } from '../model/Game4LogicSchema';
import { BaseLogic }       from '../../../core/templates/BaseLogic';
import { BaseDispatcher }  from '../../../core/templates/BaseDispatcher';
import { Game4Commands }   from './Game4Commands';
import { Game4Config }     from '../model/Game4Config';
import { TerrainDataTopdown } from '../data/Terrain Data Topdown';

import {
    IEnemy,
    EnemySnapshot,
    EnemyUpdateContext,
    EnemyRegistry,
    RockEnemy,
    BatEnemy,
    SentryEnemy
} from '../entities';

//  Hero shape
interface Hero {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    width: number;
    height: number;
}

//  Game4Logic

export class Game4Logic extends BaseLogic<Game4Config> {
    protected dispatcher: BaseDispatcher<Game4Logic>;

    private hero: Hero = { x: 0, y: 0, vx: 0, vy: 0, hp: 100, width: 32, height: 32 };
    private enemies: IEnemy[] = [];
    private currentFrame: number = 0;
    private lastHitFrame: number = 0;
    private terrainData: TerrainDataTopdown = new TerrainDataTopdown();

    constructor() {
        super(Game4LogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, Game4Commands, "Game4");

        // Register every enemy type
        // This is the ONLY place you touch when adding a new mob.
        EnemyRegistry.register('rock',   (s) => RockEnemy.fromSnapshot(s));
        EnemyRegistry.register('bat',    (s) => BatEnemy.fromSnapshot(s));
        EnemyRegistry.register('sentry', (s) => SentryEnemy.fromSnapshot(s));
    }

    //  Public API (called by Commands / dispatcher)
    public applyConfig(config: Game4Config): void {
        this.config = config;
        this.hero.hp = config.initialHP;
        this.hero.x  = config.heroStartX;
        this.hero.y  = config.heroStartY;

        // Spawn the initial wave if this is a fresh game (not a loaded save)
        if (this.enemies.length === 0) {
            for (let i = 0; i < config.spawnCount; i++) {
                this.spawnEnemy('rock');
            }
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

    /**
     * Spawn an enemy by type string.
     * The EnemyRegistry resolves the correct class automatically.
     */
    public spawnEnemy(type: string): void {
        if (!this.config || this.enemies.length >= Game4LogicSchema.MAX_ENTITIES) return;

        // Build a "seed" snapshot that each factory knows how to interpret.
        // For a fresh spawn we pass zeroes — the factory's own `spawn()` is preferred,
        // but we route through the registry so Game4Logic never imports concrete classes
        // outside the constructor registration block.
        //
        // Preferred approach: use the static spawn() helpers directly when you know
        // the type at registration time.
        const spawned = this.createFreshEnemy(type);
        if (spawned) this.enemies.push(spawned);
    }

    //  Lifecycle
    public override destroy(): void {
        super.destroy();
        this.enemies = [];
    }

    public override getSnapshot(): any {
        return {
            hero:         { ...this.hero },
            enemies:      this.enemies.map(e => e.serialize()),
            lastHitFrame: this.lastHitFrame,
            currentFrame: this.currentFrame,
            config:       this.config
        };
    }

    public override loadSnapshot(data: any): void {
        if (!data) return;
        this.config       = data.config;
        this.hero         = data.hero;
        this.lastHitFrame = data.lastHitFrame;
        this.currentFrame = data.currentFrame ?? 0;

        // Reconstruct enemy instances from their serialised snapshots
        this.enemies = (data.enemies as EnemySnapshot[]).map(snap =>
            EnemyRegistry.fromSnapshot(snap)
        );

        this.isInitialized = true;
    }

    //  Core update loop
    protected onUpdate(sharedView: Float32Array, _intView: Int32Array, frameCount: number, _fps: number): void {
        if (!this.config) return;
        this.currentFrame = frameCount;

        // Hero input
        this.processHeroInput();

        //
        if (this.currentFrame - this.lastHitFrame > 120 && this.hero.hp < 100) {
            this.hero.hp = Math.min(100, this.hero.hp + (this.hero.hp < 25 ? 0.3 : 0.1));
        }

        // ── Hero movement + terrain ─────────────────────────────────
        this.moveHero();

        // ── Enemy updates ───────────────────────────────────────────
        this.processEnemies(frameCount);

        // ── Sync to SharedArrayBuffer ───────────────────────────────
        this.syncToSAB(sharedView);
    }

    //  Private helpers
    private processHeroInput(): void {
        const keys = this.inputState.keys;
        const speed = this.config!.moveSpeed;

        let targetVx = 0;
        let targetVy = 0;

        if (keys.includes('W') || keys.includes('ARROWUP'))    targetVy = -speed;
        if (keys.includes('S') || keys.includes('ARROWDOWN'))  targetVy =  speed;
        if (keys.includes('A') || keys.includes('ARROWLEFT'))  targetVx = -speed;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) targetVx =  speed;

        this.setMovement(targetVx, targetVy);
    }

    private moveHero(): void {
        const newX = this.hero.x + this.hero.vx;
        const newY = this.hero.y + this.hero.vy;

        const adjusted = this.terrainData.resolveMovement(
            this.hero.x, this.hero.y,
            newX, newY,
            this.hero.width, this.hero.height
        );

        this.hero.x = Math.max(0, Math.min(this.config!.width,  adjusted.x));
        this.hero.y = Math.max(0, Math.min(this.config!.height, adjusted.y));
    }

    private processEnemies(frameCount: number): void {
        if (!this.config) return;

        const ctx: EnemyUpdateContext = {
            hero: {
                x: this.hero.x,
                y: this.hero.y,
                width:  this.hero.width,
                height: this.hero.height
            },
            arenaWidth:  this.config.width,
            arenaHeight: this.config.height,
            currentFrame: frameCount
        };

        // Iterate backwards so removals don't shift indices
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy  = this.enemies[i];
            const result = enemy.update(ctx);

            // Apply hero damage
            if (result.damageToHero !== 0) {
                this.modifyHp(-result.damageToHero);
            }

            // Broadcast any events (e.g. 'EXPLOSION_REQ', 'ENEMY_HIT')
            for (const evt of result.events) {
                self.postMessage({ type: 'EVENT', name: evt });
            }

            // Remove dead enemies
            if (result.dead) {
                this.enemies.splice(i, 1);
            }
        }
    }

    /**
     * Use the static `spawn()` helper on each concrete type.
     * This keeps random-position logic inside the enemy class.
     */
    private createFreshEnemy(type: string): IEnemy | null {
        if (!this.config) return null;

        const w = this.config.width;
        const h = this.config.height;

        switch (type) {
            case 'rock':   return RockEnemy.spawn(w, h);
            case 'bat':    return BatEnemy.spawn(w, h);
            case 'sentry': return SentryEnemy.spawn(w, h);
            default:
                console.warn(`[Game4Logic] Unknown enemy type for fresh spawn: "${type}"`);
                return null;
        }
    }

    //  SharedArrayBuffer sync
    private syncToSAB(sharedView: Float32Array): void {
        sharedView[Game4LogicSchema.HERO_HP] = this.hero.hp;
        sharedView[Game4LogicSchema.HERO_X]  = this.hero.x;
        sharedView[Game4LogicSchema.HERO_Y]  = this.hero.y;
        sharedView[Game4LogicSchema.ENTITY_COUNT] = this.enemies.length;

        const startIdx = Game4LogicSchema.ENTITIES_START_INDEX;
        const stride   = Game4LogicSchema.ENTITY_STRIDE;

        for (let i = 0; i < this.enemies.length; i++) {
            const e    = this.enemies[i];
            const base = startIdx + (i * stride);

            sharedView[base]     = EnemyTypeIds[e.type] ?? 0;
            sharedView[base + 1] = e.x;
            sharedView[base + 2] = e.y;
            sharedView[base + 3] = e.vx;
            sharedView[base + 4] = e.vy;
            sharedView[base + 5] = e.hp;
            sharedView[base + 6] = e.seed;
        }
    }
}