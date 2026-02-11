// src/features/Game3/view/Game3Presenter.ts
import {BasePresenter} from "../../../core/templates/BasePresenter";
import {Game3ViewSchema} from "../model/Game3ViewSchema";
import {ParsedMapData} from "../data/Game3MapData"

export class Game3Presenter extends BasePresenter {
    private _mapData: ParsedMapData | null = null;

    public set mapData(data: ParsedMapData) {
        this._mapData = data;
        this.notify();
    }

    public get mapData(): ParsedMapData | null {
        return this._mapData;
    }

    public get heroVisuals() {
        const S = Game3ViewSchema;
        const animState = this.sharedView[S.HERO_ANIM_STATE];

        let assetKey = 'hero_idle';
        let animationName = 'idle';
        if (animState === 1) {
            assetKey = 'hero_walk';
            animationName = 'walk';
        }
        if (animState === 2) {
            assetKey = 'hero_walk'; // Fallback to walk for jump
            animationName = 'walk';
        }

        return {
            x: this.sharedView[S.HERO_X] || 0,
            y: this.sharedView[S.HERO_Y] || 0,
            frame: Math.floor(this.sharedView[S.HERO_ANIM_FRAME] || 0),
            flipX: this.sharedView[S.HERO_FLIP] > 0.5,
            width: this.sharedView[S.HERO_WIDTH] || 1.0,
            height: this.sharedView[S.HERO_HEIGHT] || 1.0,
            playerScale: this.sharedView[S.PLAYER_SCALE] || 1.0,
            playerOffsetY: this.sharedView[S.PLAYER_OFFSET_Y] || 0,
            assetKey: assetKey,
            animationName: animationName,
            animState: animState
        };
    }

    public get worldScale(): number {
        return this.sharedView[Game3ViewSchema.WORLD_SCALE] || 32;
    }

    public get stats() {
        const S = Game3ViewSchema;
        return {
            hp: this.sharedView[S.HERO_HP] || 0
        };
    }

    public get visualEffects() {
        const S = Game3ViewSchema;
        return {
            uiOffset: this.sharedView[S.UI_BOUNCE] || 0,
            glitchIntensity: this.sharedView[S.GLITCH_INTENSITY] || 0,
            vignettePulse: this.sharedView[S.VIGNETTE_PULSE] || 0
        };
    }
}