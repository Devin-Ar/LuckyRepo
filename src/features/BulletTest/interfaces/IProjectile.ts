// src/features/BulletTest/interfaces/IProjectile.ts
import { IEntity } from './IEntity';

export type ProjectileOwner = 'player' | 'enemy';

export interface IProjectile extends IEntity {
    vx: number;
    vy: number;
    speed: number;
    damage: number;
    owner: ProjectileOwner;
    lifetime: number;          // max frames before auto-despawn
    spawnFrame: number;
    piercing: boolean;         // passes through targets or dies on first hit
}