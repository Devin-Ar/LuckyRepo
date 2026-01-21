// src/features/Game2/view/Game2Presenter.ts
import {BasePresenter} from "../../../core/templates/BasePresenter";
import {Game2ViewSchema} from "../model/Game2ViewSchema";

export class Game2Presenter extends BasePresenter {
    public get hp(): number {
        return this.sharedView[Game2ViewSchema.HERO_HP_DISPLAY] || 0;
    }

    public get energy(): number {
        return this.sharedView[Game2ViewSchema.ENERGY_DISPLAY] || 0;
    }

    public get scrap(): number {
        return this.sharedView[Game2ViewSchema.SCRAP_DISPLAY] || 0;
    }

    public get visualEffects() {
        return {
            uiOffset: this.sharedView[Game2ViewSchema.UI_BOUNCE] || 0,
            glitchIntensity: this.sharedView[Game2ViewSchema.GLITCH_INTENSITY] || 0,
            vignettePulse: this.sharedView[Game2ViewSchema.VIGNETTE_PULSE] || 0
        };
    }
}