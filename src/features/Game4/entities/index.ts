// src/features/Game4/entities/index.ts

// Core abstractions
export type {
    IEnemy,
    EnemySnapshot,
    HeroRef,
    EnemyUpdateContext,
    EnemyUpdateResult
} from './IEnemy';

export { BaseEnemy } from './BaseEnemy';
export { EnemyRegistry } from './EnemyRegistry';

// Concrete enemy types
export { RockEnemy }   from './types/RockEnemy';
export { BatEnemy }    from './types/BatEnemy';
export { SentryEnemy } from './types/SentryEnemy';