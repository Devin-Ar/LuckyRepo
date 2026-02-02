// src/features/Game4/entities/types/BatEnemy.ts

import { BaseEnemy } from '../BaseEnemy';
import { EnemySnapshot, EnemyUpdateContext } from '../IEnemy';

/**
 * Example homing enemy.
 *
 * Movement : accelerates toward the hero each frame.
 * Collision: deals higher contact damage than a rock.
 * Wall     : does NOT bounce — just clamps to arena edges.
 */
export class BatEnemy extends BaseEnemy {
    public readonly type = 'bat';
    public readonly collisionRadius = 16;
    public readonly contactDamage = 0.5;

    private readonly chaseSpeed: number;

    constructor(
        x: number, y: number,
        vx: number, vy: number,
        hp: number,
        seed?: number,
        chaseSpeed: number = 0.3
    ) {
        super(x, y, vx, vy, hp, seed);
        this.chaseSpeed = chaseSpeed;
    }

    // Factory helpers

    public static spawn(arenaWidth: number, arenaHeight: number): BatEnemy {
        return new BatEnemy(
            Math.random() * arenaWidth,
            Math.random() * arenaHeight,
            0, 0,
            3,          // takes a few hits to kill
            undefined,
            0.3
        );
    }

    public static fromSnapshot(s: EnemySnapshot): BatEnemy {
        return new BatEnemy(
            s.x, s.y, s.vx, s.vy, s.hp, s.seed,
            s.extra?.chaseSpeed as number ?? 0.3
        );
    }

    // ---- Behaviour overrides ---------------------------------------------

    protected override onUpdate(ctx: EnemyUpdateContext): void {
        // Steer toward the hero
        const dx = ctx.hero.x - this.x;
        const dy = ctx.hero.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        this.vx += (dx / dist) * this.chaseSpeed;
        this.vy += (dy / dist) * this.chaseSpeed;

        // Cap speed so it doesn't become a missile
        const maxSpeed = 4;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
    }

    /** Bats clamp to arena edges rather than bouncing. */
    protected override bounceOffWalls(ctx: EnemyUpdateContext): void {
        this.x = Math.max(0, Math.min(ctx.arenaWidth, this.x));
        this.y = Math.max(0, Math.min(ctx.arenaHeight, this.y));
    }

    protected override onHeroCollision(_ctx: EnemyUpdateContext): void {
        // Knock back away from hero
        this.vx *= -0.5;
        this.vy *= -0.5;
    }

    protected override serializeExtra(): Record<string, number | boolean> {
        return { chaseSpeed: this.chaseSpeed };
    }
}