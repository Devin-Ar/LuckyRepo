// src/features/Game1/view/Game1Presenter.ts
import {BasePresenter} from "../../../core/templates/BasePresenter";
import {Game1ViewMainSchema, Game1ViewRocksSchema} from "../model/Game1ViewSchema";

export class Game1Presenter extends BasePresenter {

    public get pos() {
        return {
            x: this.sharedView[Game1ViewMainSchema.HERO_X] || 0,
            y: this.sharedView[Game1ViewMainSchema.HERO_Y] || 0
        };
    }

    public get hp(): number {
        return this.sharedView[Game1ViewMainSchema.HERO_HP_DISPLAY] || 0;
    }

    public get entityCount(): number {
        return Math.floor(this.sharedView[Game1ViewMainSchema.ACTIVE_ROCK_COUNT] || 0);
    }

    public get heroVisuals() {
        return {
            x: this.sharedView[Game1ViewMainSchema.HERO_X] || 0,
            y: this.sharedView[Game1ViewMainSchema.HERO_Y] || 0,
            rotation: this.sharedView[Game1ViewMainSchema.HERO_ROTATION] || 0,
            scale: this.sharedView[Game1ViewMainSchema.HERO_SCALE] || 1,
            currentFrame: this.sharedView[Game1ViewMainSchema.HERO_FRAME] || 0
        };
    }

    public getRockViewData(index: number) {
        const rockView = this.getBuffer('rocks');
        if (!rockView) return {x: 0, y: 0, rotation: 0};

        const offset = index * Game1ViewRocksSchema.STRIDE;

        return {
            x: rockView[offset] || 0,
            y: rockView[offset + 1] || 0,
            rotation: rockView[offset + 2] || 0
        };
    }
}