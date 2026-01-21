// src/features/Game1/view/Game1ViewLogic.ts
import {Game1LogicSchema} from '../model/Game1LogicSchema';
import {Game1ViewSchema} from '../model/Game1ViewSchema';
import {BaseViewLogic} from '../../../core/templates/BaseViewLogic';

export class Game1ViewLogic extends BaseViewLogic {
    private heroRotation: number = 0;
    private globalRockRotation: number = 0;
    private heroFrame: number = 0;

    public update(dt: number, frameCount: number) {
        if (!this.hasBuffers()) return;

        const rawX = this.logicView[Game1LogicSchema.HERO_X];
        const rawY = this.logicView[Game1LogicSchema.HERO_Y];
        const rawHP = this.logicView[Game1LogicSchema.HERO_HP];

        this.heroRotation += 0.03 * (dt / 16.67);
        this.heroFrame += 0.15 * (dt / 16.67);

        this.outputView[Game1ViewSchema.HERO_X] = rawX;
        this.outputView[Game1ViewSchema.HERO_Y] = rawY;
        this.outputView[Game1ViewSchema.HERO_ROTATION] = this.heroRotation;
        this.outputView[Game1ViewSchema.HERO_SCALE] = 0.5 + (rawHP / 100);
        this.outputView[Game1ViewSchema.HERO_HP_DISPLAY] = rawHP;
        this.outputView[Game1ViewSchema.HERO_FRAME] = this.heroFrame;

        const rockCount = this.logicView[Game1LogicSchema.ENTITY_COUNT];
        this.outputView[Game1ViewSchema.ACTIVE_ROCK_COUNT] = rockCount;
        this.globalRockRotation += 0.02 * (dt / 16.67);

        for (let i = 0; i < rockCount; i++) {
            const lBase = Game1LogicSchema.ROCKS_START_INDEX + (i * Game1LogicSchema.ROCK_STRIDE);
            const vBase = Game1ViewSchema.ROCKS_START_INDEX + (i * Game1ViewSchema.ROCK_STRIDE);

            this.outputView[vBase] = this.logicView[lBase];
            this.outputView[vBase + 1] = this.logicView[lBase + 1];

            const rockSeed = this.logicView[lBase + 2];
            const individualSpeed = ((Math.floor(rockSeed) % 5) + 1) * 0.5;
            this.outputView[vBase + 2] = (this.globalRockRotation * individualSpeed) + rockSeed;
        }
    }

    public override getSnapshot() {
        return {
            heroRotation: this.heroRotation,
            globalRockRotation: this.globalRockRotation,
            heroFrame: this.heroFrame
        };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.heroRotation = data.heroRotation ?? 0;
            this.globalRockRotation = data.globalRockRotation ?? 0;
            this.heroFrame = data.heroFrame ?? 0;
        }
    }
}