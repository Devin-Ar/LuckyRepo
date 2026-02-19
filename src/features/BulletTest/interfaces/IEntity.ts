// src/features/BulletTest/interfaces/IEntity.ts

import {BHConfig} from "../model/BHConfig";

export interface IHitbox {
    offsetX: number;
    offsetY: number;
}

export interface IEntity {
    x: number;
    y: number;
    width: number;
    height: number;
    playerRelative: number;
    hitbox: IHitbox;
    seed: number;
    active: boolean;
    type: string;

    update(player: any, config: BHConfig): void;
}