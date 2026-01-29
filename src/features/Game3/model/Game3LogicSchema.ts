// src/features/Game3/model/Game3LogicSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game3LogicSchema: IBuffer = {
    HERO_HP: 0,
    HERO_X: 1,
    HERO_Y: 2,
    ENERGY: 3,
    SCRAP_COUNT: 4,

    TICK_COUNT: 5,
    FRAME_COUNT: 6,
    FPS: 7,
    REVISION: 8,

    HERO_ANIM_FRAME: 9,
    HERO_FLIP: 10,
    HERO_WIDTH: 11,
    HERO_HEIGHT: 12,
    HERO_ANIM_STATE: 13,

    BUFFER_SIZE: 1024
};
