// src/features/Game1/model/Game1ViewSchema.ts
import {IBuffer, BufferMap} from "../../../core/interfaces/IBuffer";

export const Game1ViewMainSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_ROTATION: 2,
    HERO_SCALE: 3,
    HERO_HP_DISPLAY: 4,
    HERO_FRAME: 5,
    ACTIVE_ROCK_COUNT: 6,

    BUFFER_SIZE: 128
};

export const Game1ViewRocksSchema: IBuffer = {
    START_INDEX: 0,
    STRIDE: 3,

    BUFFER_SIZE: 3000
};

export const Game1ViewSchema: BufferMap = {
    main: Game1ViewMainSchema,
    rocks: Game1ViewRocksSchema
};