// src/features/Game1/view/Game1ViewLogic.ts
import { Game1MainSchema, Game1RocksSchema } from '../model/Game1LogicSchema';
import { Game1ViewMainSchema, Game1ViewRocksSchema } from '../model/Game1ViewSchema';
import { BaseViewLogic } from '../../../core/templates/BaseViewLogic';

export class Game1ViewLogic extends BaseViewLogic {
    private heroRotation: number = 0;
    private globalRockRotation: number = 0;
    private heroFrame: number = 0;

    public update(dt: number, frameCount: number) {
        const lMain = this.logicViews.get('main');
        const lRocks = this.logicViews.get('rocks');
        const vMain = this.outputViews.get('main');
        const vRocks = this.outputViews.get('rocks');

        if (!lMain || !lRocks || !vMain || !vRocks) return;

        const rockCount = lMain[Game1MainSchema.ENTITY_COUNT];
        const vCapacity = Math.floor(vRocks.length / Game1ViewRocksSchema.STRIDE);

        if (rockCount > vCapacity) {
            if ((this as any)._outResizePending !== vCapacity) {
                self.postMessage({
                    type: 'REQUEST_RESIZE_OUTPUT',
                    payload: {
                        bufferName: 'rocks',
                        newSize: (rockCount + 1000) * Game1ViewRocksSchema.STRIDE
                    }
                });
                (this as any)._outResizePending = vCapacity;
            }
        } else {
            (this as any)._outResizePending = 0;
        }

        const rawHP = lMain[Game1MainSchema.HERO_HP];
        this.heroRotation += 0.03 * (dt / 16.67);
        this.heroFrame += 0.15 * (dt / 16.67);

        vMain[Game1ViewMainSchema.HERO_X] = lMain[Game1MainSchema.HERO_X];
        vMain[Game1ViewMainSchema.HERO_Y] = lMain[Game1MainSchema.HERO_Y];
        vMain[Game1ViewMainSchema.HERO_ROTATION] = this.heroRotation;
        vMain[Game1ViewMainSchema.HERO_SCALE] = 0.5 + (rawHP / 100);
        vMain[Game1ViewMainSchema.HERO_HP_DISPLAY] = rawHP;
        vMain[Game1ViewMainSchema.HERO_FRAME] = this.heroFrame;

        const safeRockCount = Math.min(rockCount, vCapacity);
        vMain[Game1ViewMainSchema.ACTIVE_ROCK_COUNT] = safeRockCount;

        this.globalRockRotation += 0.02 * (dt / 16.67);

        for (let i = 0; i < safeRockCount; i++) {
            const lBase = i * Game1RocksSchema.STRIDE;
            const vBase = i * Game1ViewRocksSchema.STRIDE;

            if (lBase + 2 >= lRocks.length) break;

            vRocks[vBase] = lRocks[lBase];
            vRocks[vBase + 1] = lRocks[lBase + 1];

            const rockSeed = lRocks[lBase + 2];
            const individualSpeed = ((Math.floor(rockSeed) % 5) + 1) * 0.5;
            vRocks[vBase + 2] = (this.globalRockRotation * individualSpeed) + rockSeed;
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