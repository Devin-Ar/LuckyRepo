// src/features/Game3/model/Game3ViewSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game3ViewSchema: IBuffer = {
    HERO_X: 0,
    HERO_Y: 1,

    HERO_HP_DISPLAY: 2,
    ENERGY_DISPLAY: 3,
    SCRAP_DISPLAY: 4,

    HERO_ANIM_FRAME: 5,
    HERO_FLIP: 6,
    HERO_WIDTH: 7,
    HERO_HEIGHT: 8,
    HERO_ANIM_STATE: 9,

    UI_BOUNCE: 10,
    GLITCH_INTENSITY: 11,
    VIGNETTE_PULSE: 12,
    BUFFER_SIZE: 1024
};
