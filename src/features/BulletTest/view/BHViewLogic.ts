// src/features/BulletTest/view/BHViewLogic.ts
import { BHLogicSchema } from '../model/BHLogicSchema';
import { BHViewSchema } from '../model/BHViewSchema';
import { BaseViewLogic } from '../../../core/templates/BaseViewLogic';

export class BHViewLogic extends BaseViewLogic {
    private heroRotation: number = 0;
    private globalRockRotation: number = 0;
    private heroFrame: number = 0;

    public update(dt: number, frameCount: number) {
        if (!this.hasBuffers()) return;

        const rawX = this.logicView[BHLogicSchema.HERO_X];
        const rawY = this.logicView[BHLogicSchema.HERO_Y];
        const rawHP = this.logicView[BHLogicSchema.HERO_HP];

        this.heroRotation += 0.03 * (dt / 16.67);
        this.heroFrame += 0.15 * (dt / 16.67);

        this.outputView[BHViewSchema.HERO_X] = rawX;
        this.outputView[BHViewSchema.HERO_Y] = rawY;
        this.outputView[BHViewSchema.HERO_ROTATION] = this.heroRotation;
        this.outputView[BHViewSchema.HERO_SCALE] = 0.5 + (rawHP / 100);
        this.outputView[BHViewSchema.HERO_HP_DISPLAY] = rawHP;
        this.outputView[BHViewSchema.HERO_FRAME] = this.heroFrame;

        const rockCount = this.logicView[BHLogicSchema.ENTITY_COUNT];
        this.outputView[BHViewSchema.ACTIVE_ROCK_COUNT] = rockCount;
        this.globalRockRotation += 0.02 * (dt / 16.67);

        for (let i = 0; i < rockCount; i++) {
            const lBase = BHLogicSchema.ROCKS_START_INDEX + (i * BHLogicSchema.ROCK_STRIDE);
            const vBase = BHViewSchema.ROCKS_START_INDEX + (i * BHViewSchema.ROCK_STRIDE);

            this.outputView[vBase] = this.logicView[lBase];
            this.outputView[vBase + 1] = this.logicView[lBase + 1];

            const rockSeed = this.logicView[lBase + 2];
            const individualSpeed = ((Math.floor(rockSeed) % 5) + 1) * 0.5;
            this.outputView[vBase + 2] = (this.globalRockRotation * individualSpeed) + rockSeed;

            this.outputView[vBase + 3] = this.logicView[lBase + 3];
            this.outputView[vBase + 4] = this.logicView[lBase + 4];
            this.outputView[vBase + 5] = this.logicView[lBase + 5];
        }

        // Projectiles
        const projCount = this.logicView[BHLogicSchema.PPROJ_START_INDEX - 1];
        this.outputView[BHViewSchema.PPROJ_START_INDEX - 1] = projCount;
        for (let i = 0; i < projCount; i++) {
            const lBase = BHLogicSchema.PPROJ_START_INDEX + (i * BHLogicSchema.PPROJ_STRIDE);
            const vBase = BHViewSchema.PPROJ_START_INDEX + (i * BHViewSchema.PPROJ_STRIDE);
            this.outputView[vBase] = this.logicView[lBase];
            this.outputView[vBase + 1] = this.logicView[lBase + 1];
        }

        // Wave state passthrough
        this.outputView[BHViewSchema.CURRENT_WAVE] = this.logicView[BHLogicSchema.CURRENT_WAVE];
        this.outputView[BHViewSchema.TOTAL_WAVES] = this.logicView[BHLogicSchema.TOTAL_WAVES];
        this.outputView[BHViewSchema.WAVE_STATE] = this.logicView[BHLogicSchema.WAVE_STATE];
        this.outputView[BHViewSchema.WAVE_DELAY_TIMER] = this.logicView[BHLogicSchema.WAVE_DELAY_TIMER];
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