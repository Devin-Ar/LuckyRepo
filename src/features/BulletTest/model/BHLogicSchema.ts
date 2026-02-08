// src/features/Game1/model/Game1LogicSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const BHLogicSchema: IBuffer = {
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
    PPROJ_START_INDEX: 75,
    PPROJ_STRIDE: 2,
    ROCK_STRIDE: 6,
    MAX_ROCKS: 1000,

    BUFFER_SIZE: 4096
};