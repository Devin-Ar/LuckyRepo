// src/features/Game3/model/Game3ViewSchema.ts
import {IBuffer} from "../../../core/interfaces/IBuffer";

export const Game3ViewSchema: IBuffer = {
    HERO_HP_DISPLAY: 0,
    ENERGY_DISPLAY: 1,
    SCRAP_DISPLAY: 2,

    HERO_X: 3,
    HERO_Y: 4,
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
