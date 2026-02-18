// src/features/Game3/model/Game3LogicSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game3LogicSchema: IBuffer = {
    REVISION: 1,
    FRAME_COUNT: 1,
    FPS: 2,

    // Hero State
    HERO_X: 10,
    HERO_Y: 11,
    HERO_VX: 12,
    HERO_VY: 13,
    HERO_HP: 14,

    // Hero Logical State (Logic determines state, View determines frame)
    HERO_WIDTH: 20,
    HERO_HEIGHT: 21,
    HERO_FLIP: 22,
    HERO_ANIM_STATE: 23,

    // Global Config
    WORLD_SCALE: 30,
    PLAYER_SCALE: 31,
    PLAYER_OFFSET_Y: 32,

    // Object System
    OBJ_COUNT: 50,
    // Start of the object block
    OBJ_START_INDEX: 100,
    // How many floats per object (X, Y, W, H, Type)
    OBJ_STRIDE: 5,
    // Max objects supported in SAB
    MAX_OBJECTS: 1000,

    BUFFER_SIZE: 10000 // Increased buffer size
};