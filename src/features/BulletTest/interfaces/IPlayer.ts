// src/features/BulletTest/interfaces/IPlayer.ts
import { IEntity } from './IEntity';
import { BHConfig } from '../model/BHConfig';

export interface IPlayer extends IEntity {
    vx: number;
    vy: number;
    hp: number;
    moveSpeed: number;

    applyConfig(config: BHConfig): void;
    modifyHp(amount: number): void;
}
