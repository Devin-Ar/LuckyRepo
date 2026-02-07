// src/features/BulletTest/interfaces/IPlayer.ts
import { IEntity } from './IEntity';

export interface IPlayer extends IEntity {
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    moveSpeed: number;
    invincibleUntilFrame: number;
    fireRate: number;
    lastShotFrame: number;
    damage: number;
}