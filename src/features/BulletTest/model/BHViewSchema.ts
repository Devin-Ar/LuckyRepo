// src/features/Game1/model/Game1ViewSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const BHViewSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_ROTATION: 2,
    HERO_SCALE: 3,
    HERO_HP_DISPLAY: 4,
    HERO_FRAME: 5,

    ACTIVE_ROCK_COUNT: 8,

    ROCKS_START_INDEX: 10,
    ROCK_STRIDE: 6,

    BUFFER_SIZE: 4096
};