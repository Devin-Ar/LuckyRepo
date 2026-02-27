// src/features/BulletTest/interfaces/IEntity.ts
import { BHConfig } from "../model/BHConfig";

export interface IHitbox {
    offsetX: number;
    offsetY: number;
}

export interface IEntity {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    health: number;
    playerRelative: number;
    hitbox: IHitbox;
    seed: number;
    active: boolean;
    type: string;

    update(target: any, config: BHConfig): void;
    orientation(target: any): void;
    syncToSAB(sharedView: Float32Array, base: number): void;
    modifyHP(points: number): void;
}