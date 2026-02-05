// src/features/Game3/model/Game3LogicSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game3LogicSchema: IBuffer = {
    REVISION: 0,
    FRAME_COUNT: 1,
    FPS: 2,

    // Hero State
    HERO_X: 10,
    HERO_Y: 11,
    HERO_VX: 12,
    HERO_VY: 13,
    HERO_HP: 14,

    // Hero Visuals/Config
    HERO_WIDTH: 20,
    HERO_HEIGHT: 21,
    HERO_FLIP: 22,
    HERO_ANIM_STATE: 23,
    HERO_ANIM_FRAME: 24,

    // Global Config
    WORLD_SCALE: 30,
    PLAYER_SCALE: 31,
    PLAYER_OFFSET_Y: 32,

    BUFFER_SIZE: 1024
};
