// src/features/BulletTest/interfaces/IEnemy.ts
import { IEntity } from './IEntity';

// Contact Enemy
// Damages the player by physically colliding. Chases the player.
export interface IContactEnemy extends IEntity {
    damageType: 'contact';
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    moveSpeed: number;
    contactDamage: number;
    wave: number;              // 0 | 1 | 2
    seed: number;
}

// Ranged Enemy
// Damages the player by firing projectiles. Keeps distance.
export interface IRangedEnemy extends IEntity {
    damageType: 'ranged';
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    moveSpeed: number;
    preferredDistance: number;
    fireRate: number;          // frames between shots
    lastShotFrame: number;
    projectileType: string;    // 'single' | 'spread3' | 'ring8'
    projectileDamage: number;
    wave: number;              // 0 | 1 | 2
    seed: number;
}

// Union
export type IEnemy = IContactEnemy | IRangedEnemy;

// Spawn Definitions
export interface IContactEnemySpawn {
    damageType: 'contact';
    hp: number;
    moveSpeed: number;
    contactDamage: number;
    spawnX: number;
    spawnY: number;
}

export interface IRangedEnemySpawn {
    damageType: 'ranged';
    hp: number;
    moveSpeed: number;
    preferredDistance: number;
    fireRate: number;
    projectileType: string;
    projectileDamage: number;
    spawnX: number;
    spawnY: number;
}

export type IEnemySpawn = IContactEnemySpawn | IRangedEnemySpawn;