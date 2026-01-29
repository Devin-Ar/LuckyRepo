// src/features/Game3/view/Game3Presenter.ts
import {BasePresenter} from "../../../core/templates/BasePresenter";
import {Game3ViewSchema} from "../model/Game3ViewSchema";
import {ParsedMap} from "../logic/MapParser";

export class Game3Presenter extends BasePresenter {
    private _mapData: ParsedMap | null = null;

    public set mapData(data: ParsedMap) {
        this._mapData = data;
        this.notify();
    }

    public get mapData(): ParsedMap | null {
        return this._mapData;
    }

    public get heroVisuals() {
        return {
            x: this.sharedView[Game3ViewSchema.HERO_X] || 0,
            y: this.sharedView[Game3ViewSchema.HERO_Y] || 0,
            frame: Math.floor(this.sharedView[Game3ViewSchema.HERO_ANIM_FRAME] || 0),
            flipX: this.sharedView[Game3ViewSchema.HERO_FLIP] > 0.5,
            width: this.sharedView[Game3ViewSchema.HERO_WIDTH] || 3,
            height: this.sharedView[Game3ViewSchema.HERO_HEIGHT] || 3,
            assetKey: this.sharedView[Game3ViewSchema.HERO_ANIM_STATE] > 0.5 ? 'hero_walk' : 'hero_idle'
        };
    }

    public get stats() {
        return {
            hp: this.sharedView[Game3ViewSchema.HERO_HP_DISPLAY] || 0,
            energy: this.sharedView[Game3ViewSchema.ENERGY_DISPLAY] || 0,
            scrap: this.sharedView[Game3ViewSchema.SCRAP_DISPLAY] || 0
        };
    }

    public get visualEffects() {
        return {
            uiOffset: this.sharedView[Game3ViewSchema.UI_BOUNCE] || 0,
            glitchIntensity: this.sharedView[Game3ViewSchema.GLITCH_INTENSITY] || 0,
            vignettePulse: this.sharedView[Game3ViewSchema.VIGNETTE_PULSE] || 0
        };
    }
}
