// src/features/Game4/entities/BaseEnemy.ts

import {
    IEnemy,
    EnemySnapshot,
    EnemyUpdateContext,
    EnemyUpdateResult
} from './IEnemy';

/**
 * Abstract convenience base for the common case:
 *   - moves by velocity
 *   - bounces off arena walls
 *   - circle-vs-circle collision with the hero
 *
 * Subclasses only need to set their constants and optionally override
 * `onUpdate()` for custom AI (homing, dashing, etc.).
 */
export abstract class BaseEnemy implements IEnemy {
    public abstract readonly type: string;
    public abstract readonly collisionRadius: number;
    public abstract readonly contactDamage: number;

    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public hp: number;
    public seed: number;

    constructor(x: number, y: number, vx: number, vy: number, hp: number, seed?: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hp = hp;
        this.seed = seed ?? Math.random() * 1000;
    }

    //  IEnemy.update  — template-method: shared frame, then subclass hook
    public update(ctx: EnemyUpdateContext): EnemyUpdateResult {
        const events: string[] = [];
        let damageToHero = 0;

        // 1. Let the subclass adjust velocity / position (AI behaviour)
        this.onUpdate(ctx);

        // 2. Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // 3. Arena-edge bouncing (default behaviour — override if unwanted)
        this.bounceOffWalls(ctx);

        // 4. Hero collision
        if (this.checkHeroCollision(ctx)) {
            damageToHero = this.contactDamage;
            this.onHeroCollision(ctx);
            events.push('ENEMY_HIT');
        }

        return {
            dead: this.hp <= 0,
            damageToHero,
            events
        };
    }

    //  Serialisation
    public serialize(): EnemySnapshot {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            hp: this.hp,
            seed: this.seed,
            extra: this.serializeExtra()
        };
    }

    //  Hooks for subclasses
    /**
     * Override to add AI logic that runs *before* velocity is applied.
     * For example, a homing enemy would adjust vx/vy toward the hero here.
     */
    protected onUpdate(_ctx: EnemyUpdateContext): void {
        // default: no special AI
    }

    /**
     * Called when this enemy's collision circle overlaps the hero.
     * Default: reverse + amplify velocity (the old rock behaviour).
     */
    protected onHeroCollision(_ctx: EnemyUpdateContext): void {
        this.vx *= -1.1;
        this.vy *= -1.1;
    }

    /**
     * Override to persist extra fields specific to your enemy type.
     * Return `undefined` if you have nothing extra.
     */
    protected serializeExtra(): Record<string, number | boolean> | undefined {
        return undefined;
    }

    //  Shared helpers
    protected bounceOffWalls(ctx: EnemyUpdateContext): void {
        if (this.x <= 0 || this.x >= ctx.arenaWidth) this.vx *= -1;
        if (this.y <= 0 || this.y >= ctx.arenaHeight) this.vy *= -1;
        this.x = Math.max(0, Math.min(ctx.arenaWidth, this.x));
        this.y = Math.max(0, Math.min(ctx.arenaHeight, this.y));
    }

    protected checkHeroCollision(ctx: EnemyUpdateContext): boolean {
        const dx = this.x - ctx.hero.x;
        const dy = this.y - ctx.hero.y;
        const combinedRadius = this.collisionRadius + Math.max(ctx.hero.width, ctx.hero.height) / 2;
        return dx * dx + dy * dy < combinedRadius * combinedRadius;
    }
}