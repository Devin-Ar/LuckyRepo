// src/features/Game4/entities/IEnemy.ts

/**
 * Serializable snapshot of a single enemy instance.
 * Every enemy type must be reducible to this shape for save/load and SAB sync.
 */
export interface EnemySnapshot {
    type: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    seed: number;
    /** Any extra state a specific enemy type needs to persist. */
    extra?: Record<string, number | boolean>;
}

/**
 * Minimal hero reference passed into enemy updates so enemies can
 * react to the player without holding a back-reference to Game4Logic.
 */
export interface HeroRef {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Context bag handed to every enemy on each tick.
 * Keeps enemies decoupled from the outer game logic.
 */
export interface EnemyUpdateContext {
    hero: HeroRef;
    arenaWidth: number;
    arenaHeight: number;
    currentFrame: number;
}

/**
 * Returned by an enemy's `update()` to tell Game4Logic what happened.
 */
export interface EnemyUpdateResult {
    /** True if this enemy should be removed this frame. */
    dead: boolean;
    /** Damage to apply to the hero (0 if none). */
    damageToHero: number;
    /** Event names to broadcast (e.g. 'EXPLOSION_REQ'). */
    events: string[];
}

/**
 * The contract every enemy type must implement.
 *
 * Movement, collision, and lifecycle are all owned by the enemy itself,
 * so adding a new enemy type is just writing a new class — no changes
 * to Game4Logic required.
 */
export interface IEnemy {
    /** Unique string matching the key used in EnemyRegistry (e.g. 'rock', 'bat'). */
    readonly type: string;

    /** Current world position. */
    x: number;
    y: number;

    /** Current velocity. */
    vx: number;
    vy: number;

    /** Enemy hit-points (≤ 0 means dead). */
    hp: number;

    /** Deterministic visual seed — used by the view layer for rotation etc. */
    seed: number;

    /** Collision radius (circle-based hit detection). */
    readonly collisionRadius: number;

    /** Damage dealt to the hero per collision frame. */
    readonly contactDamage: number;

    /**
     * Called once per logic tick.
     * The enemy moves itself, checks its own wall bouncing / arena bounds,
     * and reports back what happened via `EnemyUpdateResult`.
     */
    update(ctx: EnemyUpdateContext): EnemyUpdateResult;

    /** Produce a JSON-safe snapshot for save/load. */
    serialize(): EnemySnapshot;
}