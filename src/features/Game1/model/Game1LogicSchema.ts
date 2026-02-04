// src/features/Game1/model/Game1LogicSchema.ts
import {IBuffer, BufferMap} from "../../../core/interfaces/IBuffer";

export const Game1MainSchema: IBuffer = {
    HERO_HP: 0,
    HERO_X: 1,
    HERO_Y: 2,

    TICK_COUNT: 3,
    FRAME_COUNT: 4,
    FPS: 5,
    REVISION: 6,
    LAST_HIT_FRAME: 7,
    ENTITY_COUNT: 8,

    BUFFER_SIZE: 128
};

export const Game1RocksSchema: IBuffer = {
    START_INDEX: 0,
    STRIDE: 3,

    BUFFER_SIZE: 3000
};

export const Game1LogicSchema: BufferMap = {
    main: Game1MainSchema,
    rocks: Game1RocksSchema
};