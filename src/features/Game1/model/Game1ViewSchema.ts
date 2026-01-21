// src/features/Game1/model/Game1ViewSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game1ViewSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_ROTATION: 2,
    HERO_SCALE: 3,
    HERO_HP_DISPLAY: 4,
    HERO_FRAME: 5,

    ACTIVE_ROCK_COUNT: 6,

    ROCKS_START_INDEX: 10,
    ROCK_STRIDE: 3,

    BUFFER_SIZE: 4096
};