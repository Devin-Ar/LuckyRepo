// src/features/Game4/entities/types/SentryEnemy.ts

import { BaseEnemy } from '../BaseEnemy';
import { EnemySnapshot, EnemyUpdateContext } from '../IEnemy';

/**
 * Patrol enemy — walks back and forth along one axis.
 *
 * Movement : fixed-speed horizontal or vertical patrol between two bounds.
 * Collision: high contact damage, does not knock back.
 */
export class SentryEnemy extends BaseEnemy {
    public readonly type = 'sentry';
    public readonly collisionRadius = 18;
    public readonly contactDamage = 1.0;

    /** true = patrols on X axis, false = Y axis */
    private horizontal: boolean;

    constructor(
        x: number, y: number,
        vx: number, vy: number,
        hp: number,
        seed?: number,
        horizontal: boolean = true
    ) {
        super(x, y, vx, vy, hp, seed);
        this.horizontal = horizontal;
    }

    // Factory helpers

    public static spawn(arenaWidth: number, arenaHeight: number): SentryEnemy {
        const horiz = Math.random() > 0.5;
        const speed = 2 + Math.random() * 2;
        return new SentryEnemy(
            Math.random() * arenaWidth,
            Math.random() * arenaHeight,
            horiz ? speed : 0,
            horiz ? 0 : speed,
            5,
            undefined,
            horiz
        );
    }

    public static fromSnapshot(s: EnemySnapshot): SentryEnemy {
        return new SentryEnemy(
            s.x, s.y, s.vx, s.vy, s.hp, s.seed,
            s.extra?.horizontal as boolean ?? true
        );
    }

    // Behaviour overrides

    protected override onUpdate(_ctx: EnemyUpdateContext): void {
        // Sentries don't chase — their velocity was set at spawn
        // and reverses when they hit a wall (handled by bounceOffWalls).
    }

    protected override onHeroCollision(_ctx: EnemyUpdateContext): void {
        // Sentries are unfazed by hero contact — they just keep patrolling
    }

    protected override serializeExtra(): Record<string, number | boolean> {
        return { horizontal: this.horizontal };
    }
}