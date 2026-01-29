// src/features/Game4/model/Game4LogicSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game4LogicSchema: IBuffer = {
    HERO_HP: 0,
    HERO_X: 1,
    HERO_Y: 2,

    TICK_COUNT: 3,
    FRAME_COUNT: 4,
    FPS: 5,
    REVISION: 6,
    LAST_HIT_FRAME: 7,
    ENTITY_COUNT: 8,

    ROCKS_START_INDEX: 10,
    ROCK_STRIDE: 3,
    MAX_ROCKS: 1000,

    BUFFER_SIZE: 4096
};
