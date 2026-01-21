// src/features/Game2/view/Game2ViewLogic.ts
import {Game2LogicSchema} from '../model/Game2LogicSchema';
import {Game2ViewSchema} from '../model/Game2ViewSchema';
import {BaseViewLogic} from '../../../core/templates/BaseViewLogic';

export class Game2ViewLogic extends BaseViewLogic {
    private uiBounce: number = 0;
    private glitchIntensity: number = 0;
    private lastHp: number = -1;

    public update(dt: number, frameCount: number) {
        if (!this.hasBuffers()) return;

        const currentHp = this.logicView[Game2LogicSchema.HERO_HP];
        const currentEnergy = this.logicView[Game2LogicSchema.ENERGY];

        if (this.lastHp !== -1 && currentHp < this.lastHp) {
            this.glitchIntensity = 1.0;
        }
        this.lastHp = currentHp;

        this.glitchIntensity *= 0.92;

        this.outputView[Game2ViewSchema.HERO_HP_DISPLAY] = currentHp;
        this.outputView[Game2ViewSchema.ENERGY_DISPLAY] = currentEnergy;
        this.outputView[Game2ViewSchema.SCRAP_DISPLAY] = this.logicView[Game2LogicSchema.SCRAP_COUNT];

        const timeFactor = dt / 16.67;
        this.uiBounce += 0.05 * timeFactor;

        const pulseSpeed = currentEnergy < 20 ? 0.15 : 0.05;
        const vignettePulse = 0.5 + Math.sin(frameCount * pulseSpeed) * 0.2;

        this.outputView[Game2ViewSchema.UI_BOUNCE] = Math.sin(this.uiBounce) * 5;
        this.outputView[Game2ViewSchema.GLITCH_INTENSITY] = this.glitchIntensity;
        this.outputView[Game2ViewSchema.VIGNETTE_PULSE] = vignettePulse;
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