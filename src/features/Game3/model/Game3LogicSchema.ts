// src/features/Game3/model/Game3LogicSchema.ts
import { IBuffer, BufferMap } from "../../../core/interfaces/IBuffer";

export const Game3MainSchema: IBuffer = {
    REVISION: 1,
    FRAME_COUNT: 2,
    FPS: 3,

    // Hero State
    HERO_X: 10,
    HERO_Y: 11,
    HERO_VX: 12,
    HERO_VY: 13,
    HERO_HP: 14,
    HERO_WIDTH: 15,
    HERO_HEIGHT: 16,

    // Global Config
    WORLD_SCALE: 20,
    PLAYER_SCALE: 21,
    PLAYER_OFFSET_Y: 22,

    // Extended Game Logic State
    IS_ON_GROUND: 30,
    IS_WALL_SLIDING: 31,
    WALL_JUMP_TIMER: 32,
    WALL_JUMP_DIRECTION: 33,
    SPIKE_DAMAGE_TIMER: 34,
    WAS_IN_SPIKE: 35,
    PORTAL_COOLDOWN: 36,
    IS_JUMPING_FROM_GROUND: 37,
    HAS_COMPLETED_LEVEL: 38,
    SPAWN_X: 39,
    SPAWN_Y: 40,

    // Movement Settings
    MOVE_SPEED: 50,
    JUMP_POWER: 51,
    GRAVITY: 52,
    FRICTION: 53,

    OBJ_COUNT: 60,

    BUFFER_SIZE: 256
};

export const Game3PlatformsSchema: IBuffer = {
    START_INDEX: 0,
    STRIDE: 5, // x, y, width, height, type
    BUFFER_SIZE: 5000 // Support for up to 1000 objects
};

export const Game3LogicSchema: BufferMap = {
    main: Game3MainSchema,
    platforms: Game3PlatformsSchema
};