// src/features/Game4/entities/types/RockEnemy.ts

import { BaseEnemy } from '../BaseEnemy';
import { EnemySnapshot, EnemyUpdateContext } from '../IEnemy';

/**
 * Direct port of the original "rock" behaviour.
 *
 * Movement : constant velocity, bounces off arena walls.
 * Collision: reverses + amplifies velocity, deals contactDamage to hero.
 * Events   : fires 'EXPLOSION_REQ' on hero hit.
 */
export class RockEnemy extends BaseEnemy {
    public readonly type = 'rock';
    public readonly collisionRadius = 20;   // sqrt(1600) / 2 ≈ old threshold
    public readonly contactDamage = 0.2;    // matches the old -0.2 per frame

    // Factory helpers

    /** Create a brand-new rock with random velocity. */
    public static spawn(arenaWidth: number, arenaHeight: number): RockEnemy {
        return new RockEnemy(
            Math.random() * arenaWidth,
            Math.random() * arenaHeight,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            1       // rocks are 1-HP; they never die from hero contact
        );
    }

    /** Reconstruct from a serialised snapshot (save/load). */
    public static fromSnapshot(s: EnemySnapshot): RockEnemy {
        const r = new RockEnemy(s.x, s.y, s.vx, s.vy, s.hp, s.seed);
        return r;
    }

    // Behaviour overrides

    protected override onHeroCollision(_ctx: EnemyUpdateContext): void {
        // Exact old behaviour: reverse and amplify on contact
        this.vx *= -1.1;
        this.vy *= -1.1;
    }
}