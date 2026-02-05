import { Game3LogicSchema } from '../model/Game3LogicSchema';
import { Game3ViewSchema } from '../model/Game3ViewSchema';
import { BaseViewLogic } from '../../../core/templates/BaseViewLogic';

export class Game3ViewLogic extends BaseViewLogic {
    private uiBounce: number = 0;
    private glitchIntensity: number = 0;
    private lastHp: number = -1;

    public update(dt: number, frameCount: number) {
        if (!this.hasBuffers()) return;

        const L = Game3LogicSchema;
        const V = Game3ViewSchema;

        // 1. Read from Logic
        const hp = this.logicView[L.HERO_HP];

        // 2. Visual Effects
        if (this.lastHp !== -1 && hp < this.lastHp) {
            this.glitchIntensity = 1.0;
        }
        this.lastHp = hp;
        this.glitchIntensity *= 0.92;

        const timeFactor = dt / 16.67;
        this.uiBounce += 0.05 * timeFactor;
        const vignettePulse = 0.5 + Math.sin(frameCount * 0.05) * 0.2;

        // 3. Write to View
        this.outputView[V.HERO_X] = this.logicView[L.HERO_X];
        this.outputView[V.HERO_Y] = this.logicView[L.HERO_Y];
        this.outputView[V.HERO_HP] = hp;

        this.outputView[V.HERO_ANIM_FRAME] = this.logicView[L.HERO_ANIM_FRAME];
        this.outputView[V.HERO_FLIP] = this.logicView[L.HERO_FLIP];
        this.outputView[V.HERO_ANIM_STATE] = this.logicView[L.HERO_ANIM_STATE];
        this.outputView[V.HERO_WIDTH] = this.logicView[L.HERO_WIDTH];
        this.outputView[V.HERO_HEIGHT] = this.logicView[L.HERO_HEIGHT];

        this.outputView[V.WORLD_SCALE] = this.logicView[L.WORLD_SCALE];
        this.outputView[V.PLAYER_SCALE] = this.logicView[L.PLAYER_SCALE];
        this.outputView[V.PLAYER_OFFSET_Y] = this.logicView[L.PLAYER_OFFSET_Y];

        this.outputView[V.UI_BOUNCE] = Math.sin(this.uiBounce) * 5;
        this.outputView[V.GLITCH_INTENSITY] = this.glitchIntensity;
        this.outputView[V.VIGNETTE_PULSE] = vignettePulse;
    }

    public override getSnapshot() {
        return { uiBounce: this.uiBounce, glitchIntensity: this.glitchIntensity, lastHp: this.lastHp };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.uiBounce = data.uiBounce ?? 0;
            this.glitchIntensity = data.glitchIntensity ?? 0;
            this.lastHp = data.lastHp ?? -1;
        }
    }
}
