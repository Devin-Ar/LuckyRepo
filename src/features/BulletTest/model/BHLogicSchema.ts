import { IBuffer, BufferMap } from "../../../core/interfaces/IBuffer";

export const BHMainLogicSchema: IBuffer = {
    REVISION: 0,
    FRAME_COUNT: 1,
    FPS: 2,
    TICK_COUNT: 3,

    HERO_HP: 4,
    HERO_X: 5,
    HERO_Y: 6,
    HERO_VX: 36,
    HERO_VY: 37,
    HERO_WIDTH: 7,
    HERO_HEIGHT: 8,
    LAST_HIT_FRAME: 9,

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

export const BHRocksLogicSchema: IBuffer = {
    STRIDE: 10,
    FRAME: 8,
    BUFFER_SIZE: 9000 // 1000 rocks * 9
};

export const BHPProjLogicSchema: IBuffer = {
    STRIDE: 5,
    BUFFER_SIZE: 500 // 100 projectiles * 5
};

export const BHEProjLogicSchema: IBuffer = {
    STRIDE: 5,
    BUFFER_SIZE: 5000 // 1000 projectiles * 5
};

export const BHLogicSchema: BufferMap = {
    main: BHMainLogicSchema,
    rocks: BHRocksLogicSchema,
    pProjs: BHPProjLogicSchema,
    eProjs: BHEProjLogicSchema
};