// src/features/BulletTest/model/BHLogicSchema.ts
import { IBuffer } from "../../../core/interfaces/IBuffer";

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

    // Wave state (new)
    CURRENT_WAVE: 9,
    TOTAL_WAVES: 12,
    WAVE_STATE: 13,        // 0=IDLE, 1=DELAY, 2=ACTIVE, 3=CLEARED, 4=ALL_CLEARED
    WAVE_DELAY_TIMER: 14,

    // Exit door
    EXIT_DOOR_ACTIVE: 15,  // 1 = visible, 0 = hidden
    EXIT_DOOR_X: 16,
    EXIT_DOOR_Y: 17,
    CURRENT_LEVEL: 18,     // 0=Level1, 1=Level2, 2=Level3

    ROCKS_START_INDEX: 20,
    PPROJ_START_INDEX: 200,
    PPROJ_STRIDE: 2,
    ROCK_STRIDE: 6,
    MAX_ROCKS: 1000,

    BUFFER_SIZE: 4096
};