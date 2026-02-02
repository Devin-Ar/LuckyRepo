// src/features/Game4/entities/EnemyRegistry.ts

import { IEnemy, EnemySnapshot } from './IEnemy';

/**
 * Factory signature: build a fresh enemy from spawn params,
 * OR reconstruct one from a saved snapshot.
 */
export type EnemyFactory = (snapshot: EnemySnapshot) => IEnemy;

/**
 * Central registry of every enemy type that can appear in Game4.
 *
 * Usage:
 *   // At startup (e.g. in Game4Logic constructor)
 *   EnemyRegistry.register('rock',  (s) => RockEnemy.fromSnapshot(s));
 *   EnemyRegistry.register('bat',   (s) => BatEnemy.fromSnapshot(s));
 *
 *   // Spawning a new enemy
 *   const enemy = EnemyRegistry.create('rock', { type:'rock', x:100, ... });
 *
 *   // Deserialising a save file
 *   const enemy = EnemyRegistry.create(snapshot.type, snapshot);
 */
export class EnemyRegistry {
    private static factories: Map<string, EnemyFactory> = new Map();

    public static register(type: string, factory: EnemyFactory): void {
        if (EnemyRegistry.factories.has(type)) {
            console.warn(`[EnemyRegistry] Overwriting factory for type: ${type}`);
        }
        EnemyRegistry.factories.set(type, factory);
    }

    public static create(type: string, snapshot: EnemySnapshot): IEnemy {
        const factory = EnemyRegistry.factories.get(type);
        if (!factory) {
            throw new Error(`[EnemyRegistry] No factory registered for enemy type: "${type}"`);
        }
        return factory(snapshot);
    }

    public static has(type: string): boolean {
        return EnemyRegistry.factories.has(type);
    }

    /** Convenience: rebuild an enemy from any snapshot without knowing its concrete class. */
    public static fromSnapshot(snapshot: EnemySnapshot): IEnemy {
        return EnemyRegistry.create(snapshot.type, snapshot);
    }
}