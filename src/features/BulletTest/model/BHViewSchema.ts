import { IBuffer, BufferMap } from "../../../core/interfaces/IBuffer";

export const BHMainViewSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_VX: 36,
    HERO_VY: 37,
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

    // Boss animation
    BOSS_ANIM_FRAME: 23,
    BOSS_PHASE: 24,
    BOSS_WIDTH: 25,
    BOSS_HEIGHT: 26,

    // Counts for other buffers
    ROCK_COUNT: 30,
    PPROJ_COUNT: 31,
    EPROJ_COUNT: 32,

    MOUSE_RELATIVE: 33,
    MAP_WIDTH: 34,
    MAP_HEIGHT: 35,

    // Economy — cross-game persistent
    POINTS: 38,
    COINS: 39,

    // Inventory — cross-game persistent
    HELD_ITEM_ID: 40,
    ITEM_DROP_ACTIVE: 41,
    ITEM_DROP_X: 42,
    ITEM_DROP_Y: 43,
    ITEM_DROP_TYPE: 44,

    // Second item drop
    ITEM_DROP2_ACTIVE: 45,
    ITEM_DROP2_X: 46,
    ITEM_DROP2_Y: 47,
    ITEM_DROP2_TYPE: 48,

    // Drop free flags (swapped items have no cost)
    ITEM_DROP_FREE: 49,
    ITEM_DROP2_FREE: 50,

    BUFFER_SIZE: 128
};

export const BHRocksViewSchema: IBuffer = {
    STRIDE: 12,
    FRAME: 8,
    HP: 10,
    MAX_HP: 11,
    BUFFER_SIZE: 12000
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