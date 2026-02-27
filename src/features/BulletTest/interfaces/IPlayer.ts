// src/features/BulletTest/interfaces/IPlayer.ts
import { IEntity } from './IEntity';
import { BHConfig } from '../model/BHConfig';

export interface IPlayer extends IEntity {
    hp: number;
    moveSpeed: number;

    applyConfig(config: BHConfig): void;
    modifyHp(amount: number): void;
    setMovement(vx?: number, vy?: number): void;
    updatePlayer(inputState: any, config: BHConfig, frameCount: number): void;
    playerAction(): boolean;
    fireProjectile(inputState: any, config: BHConfig): any;
}