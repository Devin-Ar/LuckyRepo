// src/features/BulletTest/interfaces/IProjectile.ts
import { IEntity } from './IEntity';
import {baseEntity} from "./baseInterfaces/baseEntity";

export type ProjectileOwner = 'player' | 'enemy';

export interface IProjectile extends IEntity {
    vx: number;
    vy: number;
    damage: number;

    collided(entity : baseEntity[]) : void;
}