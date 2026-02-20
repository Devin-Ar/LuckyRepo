// src/features/Game3/model/Game3ViewSchema.ts
import { IBuffer, BufferMap } from "../../../core/interfaces/IBuffer";

export const Game3ViewMainSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,
    HERO_HP: 2,

    // Visuals calculated by ViewLogic
    HERO_ANIM_FRAME: 5,
    HERO_FLIP: 6,
    HERO_WIDTH: 7,
    HERO_HEIGHT: 8,
    HERO_ANIM_STATE: 9,

    WORLD_SCALE: 10,
    PLAYER_SCALE: 11,
    PLAYER_OFFSET_Y: 12,

    UI_BOUNCE: 20,
    GLITCH_INTENSITY: 21,
    VIGNETTE_PULSE: 22,

    OBJ_COUNT: 30,

    BUFFER_SIZE: 128
};

export const Game3ViewPlatformsSchema: IBuffer = {
    START_INDEX: 0,
    STRIDE: 5,
    BUFFER_SIZE: 5000
};

export const Game3ViewSchema: BufferMap = {
    main: Game3ViewMainSchema,
    platforms: Game3ViewPlatformsSchema
};