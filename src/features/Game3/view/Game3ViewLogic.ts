// src/features/Game3/view/Game3ViewLogic.ts
import {Game3LogicSchema} from '../model/Game3LogicSchema';
import {Game3ViewSchema} from '../model/Game3ViewSchema';
import {BaseViewLogic} from '../../../core/templates/BaseViewLogic';

export class Game3ViewLogic extends BaseViewLogic {
    private uiBounce: number = 0;
    private glitchIntensity: number = 0;
    private lastHp: number = -1;

    public update(dt: number, frameCount: number) {
        if (!this.hasBuffers()) return;

        const currentHp = this.logicView[Game3LogicSchema.HERO_HP];
        const currentEnergy = this.logicView[Game3LogicSchema.ENERGY];

        if (this.lastHp !== -1 && currentHp < this.lastHp) {
            this.glitchIntensity = 1.0;
        }
        this.lastHp = currentHp;

        this.glitchIntensity *= 0.92;

        this.outputView[Game3ViewSchema.HERO_HP_DISPLAY] = currentHp;
        this.outputView[Game3ViewSchema.ENERGY_DISPLAY] = currentEnergy;
        this.outputView[Game3ViewSchema.SCRAP_DISPLAY] = this.logicView[Game3LogicSchema.SCRAP_COUNT];

        this.outputView[Game3ViewSchema.HERO_X] = this.logicView[Game3LogicSchema.HERO_X];
        this.outputView[Game3ViewSchema.HERO_Y] = this.logicView[Game3LogicSchema.HERO_Y];
        this.outputView[Game3ViewSchema.HERO_ANIM_FRAME] = this.logicView[Game3LogicSchema.HERO_ANIM_FRAME];
        this.outputView[Game3ViewSchema.HERO_FLIP] = this.logicView[Game3LogicSchema.HERO_FLIP];
        this.outputView[Game3ViewSchema.HERO_WIDTH] = this.logicView[Game3LogicSchema.HERO_WIDTH];
        this.outputView[Game3ViewSchema.HERO_HEIGHT] = this.logicView[Game3LogicSchema.HERO_HEIGHT];
        this.outputView[Game3ViewSchema.HERO_ANIM_STATE] = this.logicView[Game3LogicSchema.HERO_ANIM_STATE];

        const timeFactor = dt / 16.67;
        this.uiBounce += 0.05 * timeFactor;

        const pulseSpeed = currentEnergy < 20 ? 0.15 : 0.05;
        const vignettePulse = 0.5 + Math.sin(frameCount * pulseSpeed) * 0.2;

        this.outputView[Game3ViewSchema.UI_BOUNCE] = Math.sin(this.uiBounce) * 5;
        this.outputView[Game3ViewSchema.GLITCH_INTENSITY] = this.glitchIntensity;
        this.outputView[Game3ViewSchema.VIGNETTE_PULSE] = vignettePulse;
    }

    public override getSnapshot() {
        return {
            uiBounce: this.uiBounce,
            glitchIntensity: this.glitchIntensity,
            lastHp: this.lastHp
        };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.uiBounce = data.uiBounce ?? 0;
            this.glitchIntensity = data.glitchIntensity ?? 0;
            this.lastHp = data.lastHp ?? -1;
        }
    }
}
