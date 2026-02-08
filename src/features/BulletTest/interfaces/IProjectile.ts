// src/features/BulletTest/interfaces/IProjectile.ts
import { IEntity } from './IEntity';

export type ProjectileOwner = 'player' | 'enemy';

export interface IProjectile extends IEntity {
    vx: number;
    vy: number;
    damage: number;
}