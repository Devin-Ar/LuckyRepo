// src/features/BulletTest/interfaces/IEntity.ts

export interface IHitbox {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}

export interface IEntity {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    hitbox: IHitbox;
    active: boolean;
}