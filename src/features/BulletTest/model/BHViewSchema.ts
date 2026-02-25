import { IBuffer, BufferMap } from "../../../core/interfaces/IBuffer";

export const BHMainViewSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_ROTATION: 2,
    HERO_SCALE: 3,
    HERO_HP_DISPLAY: 4,
    HERO_FRAME: 5,
    HERO_WIDTH: 6,
    HERO_HEIGHT: 7,

    // Wave state
    CURRENT_WAVE: 10,
    TOTAL_WAVES: 11,
    WAVE_STATE: 12,
    WAVE_DELAY_TIMER: 13,

    // Exit door
    EXIT_DOOR_ACTIVE: 14,
    EXIT_DOOR_X: 15,
    EXIT_DOOR_Y: 16,
    CURRENT_LEVEL: 17,

    // Boss state
    BOSS_HP: 18,
    BOSS_VULNERABLE: 19,
    BOSS_X: 20,
    BOSS_Y: 21,
    BOSS_ACTIVE: 22,

    // Counts for other buffers
    ROCK_COUNT: 30,
    PPROJ_COUNT: 31,
    EPROJ_COUNT: 32,

    MOUSE_RELATIVE: 33,
    MAP_WIDTH: 34,
    MAP_HEIGHT: 35,

    BUFFER_SIZE: 128
};

export const BHRocksViewSchema: IBuffer = {
    STRIDE: 8,
    BUFFER_SIZE: 8000
};

export const BHPProjViewSchema: IBuffer = {
    STRIDE: 5,
    BUFFER_SIZE: 500
};

export const BHEProjViewSchema: IBuffer = {
    STRIDE: 5,
    BUFFER_SIZE: 5000
};

export const BHViewSchema: BufferMap = {
    main: BHMainViewSchema,
    rocks: BHRocksViewSchema,
    pProjs: BHPProjViewSchema,
    eProjs: BHEProjViewSchema
};