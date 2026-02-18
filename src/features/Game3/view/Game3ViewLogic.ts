// src/features/Game3/logic/Game3ViewLogic.ts
import { Game3LogicSchema } from '../model/Game3LogicSchema';
import { Game3ViewSchema } from '../model/Game3ViewSchema';
import { BaseViewLogic } from '../../../core/templates/BaseViewLogic';

export class Game3ViewLogic extends BaseViewLogic {
    private uiBounce: number = 0;
    private glitchIntensity: number = 0;
    private lastHp: number = -1;

    // Animation internal state
    private animFrame = 0;
    private animTimer = 0;
    private lastAnimState = 0;

    public update(dt: number, frameCount: number) {
        if (!this.hasBuffers()) return;

        const L = Game3LogicSchema;
        const V = Game3ViewSchema;

        // 1. Read Basic State from Logic
        const hp = this.logicView[L.HERO_HP];
        const animState = this.logicView[L.HERO_ANIM_STATE];

        // 2. Process Animation (Moved from Logic)
        if (animState !== this.lastAnimState) {
            this.animFrame = 0;
            this.animTimer = 0;
            this.lastAnimState = animState;
        } else {
            this.animTimer++;
            // Basic animation speed: changes every 6 ticks
            if (this.animTimer >= 6) {
                this.animFrame = (this.animFrame + 1) % 12; // Modulo 12 assumed from sprite sheet
                this.animTimer = 0;
            }
        }

        // 3. Visual Effects (UI Bounce, etc)
        if (this.lastHp !== -1 && hp < this.lastHp) {
            this.glitchIntensity = 1.0;
        }
        this.lastHp = hp;
        this.glitchIntensity *= 0.92;

        const timeFactor = dt / 16.67;
        this.uiBounce += 0.05 * timeFactor;
        const vignettePulse = 0.5 + Math.sin(frameCount * 0.05) * 0.2;

        // 4. Write to View Buffer
        this.outputView[V.HERO_X] = this.logicView[L.HERO_X];
        this.outputView[V.HERO_Y] = this.logicView[L.HERO_Y];
        this.outputView[V.HERO_HP] = hp;

        this.outputView[V.HERO_ANIM_FRAME] = this.animFrame; // Calculated here!
        this.outputView[V.HERO_FLIP] = this.logicView[L.HERO_FLIP];
        this.outputView[V.HERO_ANIM_STATE] = animState;
        this.outputView[V.HERO_WIDTH] = this.logicView[L.HERO_WIDTH];
        this.outputView[V.HERO_HEIGHT] = this.logicView[L.HERO_HEIGHT];

        this.outputView[V.WORLD_SCALE] = this.logicView[L.WORLD_SCALE];
        this.outputView[V.PLAYER_SCALE] = this.logicView[L.PLAYER_SCALE];
        this.outputView[V.PLAYER_OFFSET_Y] = this.logicView[L.PLAYER_OFFSET_Y];

        this.outputView[V.UI_BOUNCE] = Math.sin(this.uiBounce) * 5;
        this.outputView[V.GLITCH_INTENSITY] = this.glitchIntensity;
        this.outputView[V.VIGNETTE_PULSE] = vignettePulse;

        // 5. Sync Objects (Pass-through from Logic SAB to View SAB)
        const objCount = this.logicView[L.OBJ_COUNT];
        this.outputView[V.OBJ_COUNT] = objCount;

        // Block copy object data
        const startIdx = L.OBJ_START_INDEX;
        const totalFloats = objCount * L.OBJ_STRIDE;
        for(let i=0; i<totalFloats; i++) {
            this.outputView[startIdx + i] = this.logicView[startIdx + i];
        }
    }

    public override getSnapshot() {
        return {
            uiBounce: this.uiBounce,
            glitchIntensity: this.glitchIntensity,
            lastHp: this.lastHp,
            animFrame: this.animFrame,
            animTimer: this.animTimer,
            lastAnimState: this.lastAnimState
        };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.uiBounce = data.uiBounce ?? 0;
            this.glitchIntensity = data.glitchIntensity ?? 0;
            this.lastHp = data.lastHp ?? -1;
            this.animFrame = data.animFrame ?? 0;
            this.animTimer = data.animTimer ?? 0;
            this.lastAnimState = data.lastAnimState ?? 0;
        }
    }
}