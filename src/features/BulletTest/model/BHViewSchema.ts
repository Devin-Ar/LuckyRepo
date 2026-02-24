// src/features/BulletTest/model/BHViewSchema.ts
import { IBuffer } from "../../../core/interfaces/IBuffer";

export const BHViewSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_ROTATION: 2,
    HERO_SCALE: 3,
    HERO_HP_DISPLAY: 4,
    HERO_FRAME: 5,

    ACTIVE_ROCK_COUNT: 8,

    // Wave display
    CURRENT_WAVE: 9,
    TOTAL_WAVES: 12,
    WAVE_STATE: 13,
    WAVE_DELAY_TIMER: 14,

    // Exit door
    EXIT_DOOR_ACTIVE: 15,
    EXIT_DOOR_X: 16,
    EXIT_DOOR_Y: 17,
    CURRENT_LEVEL: 18,
    BOSS_HP: 19,
    BOSS_VULNERABLE: 20,

    ROCKS_START_INDEX: 21,
    BOSS_X: 21,
    BOSS_Y: 22,
    BOSS_ACTIVE: 23,

    ROCKS_START_INDEX_ACTUAL: 24,
    ROCK_STRIDE: 8,
    PPROJ_START_INDEX: 200,
    PPROJ_STRIDE: 5,
    EPROJ_START_INDEX: 300,
    EPROJ_STRIDE: 5,

    BUFFER_SIZE: 4096
};