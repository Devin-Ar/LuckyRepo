// src/features/BulletTest/view/BHViewLogic.ts
import {  BHMainLogicSchema, BHRocksLogicSchema, BHPProjLogicSchema, BHEProjLogicSchema } from '../model/BHLogicSchema';
import {  BHMainViewSchema, BHRocksViewSchema, BHPProjViewSchema, BHEProjViewSchema } from '../model/BHViewSchema';
import { BaseViewLogic } from '../../../core/templates/BaseViewLogic';

export class BHViewLogic extends BaseViewLogic {
    private heroRotation: number = 0;
    private globalRockRotation: number = 0;

    private animFrame = 0;
    private animTimer = 0;

    public update(dt: number, frameCount: number) {
        const lMain = this.logicViews.get('main');
        const lRocks = this.logicViews.get('rocks');
        const lPProjs = this.logicViews.get('pProjs');
        const lEProjs = this.logicViews.get('eProjs');

        const vMain = this.outputViews.get('main');
        const vRocks = this.outputViews.get('rocks');
        const vPProjs = this.outputViews.get('pProjs');
        const vEProjs = this.outputViews.get('eProjs');

        if (!lMain || !lRocks || !lPProjs || !lEProjs || !vMain || !vRocks || !vPProjs || !vEProjs) return;

        const LM = BHMainLogicSchema;
        const VM = BHMainViewSchema;

        const rawX = lMain[LM.HERO_X];
        const rawY = lMain[LM.HERO_Y];
        const rawHP = lMain[LM.HERO_HP];

        const timeFactor = dt / 16.67;
        this.heroRotation += 0.03 * timeFactor;

        this.animTimer++;
        if (this.animTimer >= 6) {
            this.animFrame = (this.animFrame + 1) % 3;
            this.animTimer = 0;
        }

        vMain[VM.HERO_X] = rawX;
        vMain[VM.HERO_Y] = rawY;
        vMain[VM.HERO_VX] = lMain[LM.HERO_VX];
        vMain[VM.HERO_VY] = lMain[LM.HERO_VY];
        vMain[VM.HERO_WIDTH] = lMain[LM.HERO_WIDTH];
        vMain[VM.HERO_HEIGHT] = lMain[LM.HERO_HEIGHT];
        vMain[VM.HERO_ROTATION] = this.heroRotation;
        vMain[VM.HERO_SCALE] = 0.5 + (rawHP / 100);
        vMain[VM.MOUSE_RELATIVE] = lMain[LM.MOUSE_RELATIVE];
        vMain[VM.MAP_WIDTH] = lMain[LM.MAP_WIDTH];
        vMain[VM.MAP_HEIGHT] = lMain[LM.MAP_HEIGHT];
        vMain[VM.HERO_HP_DISPLAY] = rawHP;
        vMain[VM.HERO_FRAME] = this.animFrame;

        // Rocks
        const rockCount = lMain[LM.ROCK_COUNT];
        vMain[VM.ROCK_COUNT] = rockCount;
        this.globalRockRotation += 0.02 * timeFactor;

        for (let i = 0; i < rockCount; i++) {
            const lBase = i * BHRocksLogicSchema.STRIDE;
            const vBase = i * BHRocksViewSchema.STRIDE;
            vRocks[vBase] = lRocks[lBase];
            vRocks[vBase + 1] = lRocks[lBase + 1];
            const rockSeed = lRocks[lBase + 2];
            const individualSpeed = ((Math.floor(rockSeed) % 5) + 1) * 0.5;
            vRocks[vBase + 2] = (this.globalRockRotation * individualSpeed) + rockSeed;
            vRocks[vBase + 3] = lRocks[lBase + 3];
            vRocks[vBase + 4] = lRocks[lBase + 4];
            vRocks[vBase + 5] = lRocks[lBase + 5];
            vRocks[vBase + 6] = lRocks[lBase + 6];
            vRocks[vBase + 7] = lRocks[lBase + 7];
        }

        // Projectiles
        const pProjCount = lMain[LM.PPROJ_COUNT];
        vMain[VM.PPROJ_COUNT] = pProjCount;
        for (let i = 0; i < pProjCount; i++) {
            const lBase = i * BHPProjLogicSchema.STRIDE;
            const vBase = i * BHPProjViewSchema.STRIDE;
            vPProjs[vBase] = lPProjs[lBase];
            vPProjs[vBase + 1] = lPProjs[lBase + 1];
            vPProjs[vBase + 2] = lPProjs[lBase + 2];
            vPProjs[vBase + 3] = lPProjs[lBase + 3];
            vPProjs[vBase + 4] = lPProjs[lBase + 4];
        }

        const eProjCount = lMain[LM.EPROJ_COUNT];
        vMain[VM.EPROJ_COUNT] = eProjCount;
        for (let i = 0; i < eProjCount; i++) {
            const lBase = i * BHEProjLogicSchema.STRIDE;
            const vBase = i * BHEProjViewSchema.STRIDE;
            vEProjs[vBase] = lEProjs[lBase];
            vEProjs[vBase + 1] = lEProjs[lBase + 1];
            vEProjs[vBase + 2] = lEProjs[lBase + 2];
            vEProjs[vBase + 3] = lEProjs[lBase + 3];
            vEProjs[vBase + 4] = lEProjs[lBase + 4];
        }

        vMain[VM.CURRENT_WAVE] = lMain[LM.CURRENT_WAVE];
        vMain[VM.TOTAL_WAVES] = lMain[LM.TOTAL_WAVES];
        vMain[VM.WAVE_STATE] = lMain[LM.WAVE_STATE];
        vMain[VM.WAVE_DELAY_TIMER] = lMain[LM.WAVE_DELAY_TIMER];
        vMain[VM.EXIT_DOOR_ACTIVE] = lMain[LM.EXIT_DOOR_ACTIVE];
        vMain[VM.EXIT_DOOR_X] = lMain[LM.EXIT_DOOR_X];
        vMain[VM.EXIT_DOOR_Y] = lMain[LM.EXIT_DOOR_Y];
        vMain[VM.CURRENT_LEVEL] = lMain[LM.CURRENT_LEVEL];
        vMain[VM.BOSS_HP] = lMain[LM.BOSS_HP];
        vMain[VM.BOSS_VULNERABLE] = lMain[LM.BOSS_VULNERABLE];
        vMain[VM.BOSS_X] = lMain[LM.BOSS_X];
        vMain[VM.BOSS_Y] = lMain[LM.BOSS_Y];
        vMain[VM.BOSS_ACTIVE] = lMain[LM.BOSS_ACTIVE];
    }

    public override getSnapshot() {
        return {
            heroRotation: this.heroRotation,
            globalRockRotation: this.globalRockRotation,
            animFrame: this.animFrame,
            animTimer: this.animTimer
        };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.heroRotation = data.heroRotation ?? 0;
            this.globalRockRotation = data.globalRockRotation ?? 0;
            this.animFrame = data.animFrame ?? 0;
            this.animTimer = data.animTimer ?? 0;
        }
    }
}