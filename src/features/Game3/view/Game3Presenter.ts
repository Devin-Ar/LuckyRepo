// src/features/Game3/view/Game3Presenter.ts
import { BasePresenter } from "../../../core/templates/BasePresenter";
import { Game3ViewMainSchema, Game3ViewPlatformsSchema } from "../model/Game3ViewSchema";

export interface ViewObject {
    x: number;
    y: number;
    width: number;
    height: number;
    type: number;
}

export class Game3Presenter extends BasePresenter {

    public get objects(): ViewObject[] {
        const vMain = this._sharedViews.get('main');
        const vPlatforms = this._sharedViews.get('platforms');

        if (!vMain || !vPlatforms) return [];

        const count = vMain[Game3ViewMainSchema.OBJ_COUNT];
        const stride = Game3ViewPlatformsSchema.STRIDE;
        const result: ViewObject[] = [];

        for (let i = 0; i < count; i++) {
            const base = i * stride;
            result.push({
                x: vPlatforms[base],
                y: vPlatforms[base + 1],
                width: vPlatforms[base + 2],
                height: vPlatforms[base + 3],
                type: vPlatforms[base + 4]
            });
        }
        return result;
    }

    /**
     * Resolves hero visuals including the new Air and WallSlide states
     */
    public get heroVisuals() {
        const S = Game3ViewMainSchema;
        const view = this._sharedViews.get('main');
        if (!view) return null;

        const animState = view[S.HERO_ANIM_STATE];

        let assetKey = 'hero_idle';
        let animationName = 'idle';

        switch (animState) {
            case 1: // Walking
                assetKey = 'hero_walk';
                animationName = 'walk';
                break;
            case 2: // Air / Jumping
                assetKey = 'hero_jump';
                animationName = 'jump';
                break;
            case 3: // Wall Sliding
                assetKey = 'hero_wall_slide';
                animationName = 'slide';
                break;
            default: // 0 - Idle
                assetKey = 'hero_idle';
                animationName = 'idle';
                break;
        }

        return {
            x: view[S.HERO_X] || 0,
            y: view[S.HERO_Y] || 0,
            frame: Math.floor(view[S.HERO_ANIM_FRAME] || 0),
            flipX: view[S.HERO_FLIP] > 0.5,
            width: view[S.HERO_WIDTH] || 1.0,
            height: view[S.HERO_HEIGHT] || 1.0,
            playerScale: view[S.PLAYER_SCALE] || 1.0,
            playerOffsetY: view[S.PLAYER_OFFSET_Y] || 0,
            assetKey,
            animationName,
            animState
        };
    }

    public get worldScale(): number {
        const view = this._sharedViews.get('main');
        return view ? view[Game3ViewMainSchema.WORLD_SCALE] : 32;
    }

    public get stats() {
        const view = this._sharedViews.get('main');
        const S = Game3ViewMainSchema;
        return {
            hp: view ? view[S.HERO_HP] : 0
        };
    }

    public get visualEffects() {
        const view = this._sharedViews.get('main');
        const S = Game3ViewMainSchema;
        if (!view) return { uiOffset: 0, glitchIntensity: 0, vignettePulse: 0 };

        return {
            uiOffset: view[S.UI_BOUNCE] || 0,
            glitchIntensity: view[S.GLITCH_INTENSITY] || 0,
            vignettePulse: view[S.VIGNETTE_PULSE] || 0
        };
    }
}