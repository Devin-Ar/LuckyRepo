// src/features/BulletTest/interfaces/IEnemy.ts
import { IEntity } from './IEntity';
import { IPlayer } from './IPlayer';
import { BHConfig } from '../model/BHConfig';
import { enemyProjectile } from './baseInterfaces/baseProjectile';

// Contact Enemy — chases and damages player on collision
export interface IContactEnemy extends IEntity {
    damageType: 'contact';
    hp: number;
    maxHp: number;
    moveSpeed: number;
    contactDamage: number;
    wave: number;

    update(player: IPlayer, config: BHConfig): void;
}

// Ranged Enemy — keeps distance and fires projectiles
export interface IRangedEnemy extends IEntity {
    damageType: 'ranged';
    hp: number;
    maxHp: number;
    moveSpeed: number;
    fireRate: number;
    lastShotFrame: number;
    projectileDamage: number;
    wave: number;

    update(player: IPlayer, config: BHConfig): void;
    fireProjectiles(player: IPlayer, currentShots: enemyProjectile[]): void;
}

// Boss Enemy — multi-phase boss with unique attack patterns
export interface IBossEnemy extends IEntity {
    vulnerable: boolean;
    phase: number;

    update(player: IPlayer, config: BHConfig): void;
    updateAttacks(player: IPlayer, frameCount: number, enemyProjectiles: enemyProjectile[]): void;
}

// Union
export type IEnemy = IContactEnemy | IRangedEnemy | IBossEnemy;

// Spawn Definitions (used by WaveManager)
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
    fireRate: number;
    projectileDamage: number;
    spawnX: number;
    spawnY: number;
}

export type IEnemySpawn = IContactEnemySpawn | IRangedEnemySpawn;