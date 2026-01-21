// src/features/Game1/view/Game1Presenter.ts
import {BasePresenter} from "../../../core/templates/BasePresenter";
import {Game1ViewSchema} from "../model/Game1ViewSchema";

export class Game1Presenter extends BasePresenter {

    public get pos() {
        return {
            x: this.sharedView[Game1ViewSchema.HERO_X] || 0,
            y: this.sharedView[Game1ViewSchema.HERO_Y] || 0
        };
    }

    public get hp(): number {
        return this.sharedView[Game1ViewSchema.HERO_HP_DISPLAY] || 0;
    }

    public get entityCount(): number {
        return Math.floor(this.sharedView[Game1ViewSchema.ACTIVE_ROCK_COUNT] || 0);
    }

    public get heroVisuals() {
        return {
            x: this.sharedView[Game1ViewSchema.HERO_X] || 0,
            y: this.sharedView[Game1ViewSchema.HERO_Y] || 0,
            rotation: this.sharedView[Game1ViewSchema.HERO_ROTATION] || 0,
            scale: this.sharedView[Game1ViewSchema.HERO_SCALE] || 1,
            currentFrame: this.sharedView[Game1ViewSchema.HERO_FRAME] || 0
        };
    }

    public getRockViewData(index: number) {
        const offset = Game1ViewSchema.ROCKS_START_INDEX + (index * Game1ViewSchema.ROCK_STRIDE);
        return {
            x: this.sharedView[offset] || 0,
            y: this.sharedView[offset + 1] || 0,
            rotation: this.sharedView[offset + 2] || 0
        };
    }
}