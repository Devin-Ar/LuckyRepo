// src/features/BulletTest/view/BHPresenter.ts
import { BasePresenter } from "../../../core/templates/BasePresenter";
import { BHMainViewSchema, BHRocksViewSchema, BHPProjViewSchema, BHEProjViewSchema } from "../model/BHViewSchema";

const WAVE_STATE_LABELS = ['IDLE', 'DELAY', 'ACTIVE', 'CLEARED', 'ALL_CLEARED'] as const;

export class BHPresenter extends BasePresenter {

    private get mainView() { return this.sharedView; } // 'main' is default
    private get rocksView() { return this.getBuffer('rocks') || new Float32Array(0); }
    private get pProjsView() { return this.getBuffer('pProjs') || new Float32Array(0); }
    private get eProjsView() { return this.getBuffer('eProjs') || new Float32Array(0); }

    public get pos() {
        return {
            x: this.mainView[BHMainViewSchema.HERO_X] || 0,
            y: this.mainView[BHMainViewSchema.HERO_Y] || 0
        };
    }

    public get hp(): number {
        return this.mainView[BHMainViewSchema.HERO_HP_DISPLAY] || 0;
    }

    public get entityCount(): number {
        return Math.floor(this.mainView[BHMainViewSchema.ROCK_COUNT] || 0);
    }

    public get projCount(): number {
        return Math.floor(this.mainView[BHMainViewSchema.PPROJ_COUNT] || 0);
    }

    public get projEnemyCount(): number {
        return Math.floor(this.mainView[BHMainViewSchema.EPROJ_COUNT] || 0);
    }

    // Wave state

    public get currentWave(): number {
        return Math.floor(this.mainView[BHMainViewSchema.CURRENT_WAVE] || 0);
    }

    public get totalWaves(): number {
        return Math.floor(this.mainView[BHMainViewSchema.TOTAL_WAVES] || 0);
    }

    public get waveState(): string {
        const idx = Math.floor(this.mainView[BHMainViewSchema.WAVE_STATE] || 0);
        return WAVE_STATE_LABELS[idx] || 'IDLE';
    }

    public get waveDelayTimer(): number {
        return Math.floor(this.mainView[BHMainViewSchema.WAVE_DELAY_TIMER] || 0);
    }

    public get isRoomCleared(): boolean {
        return this.waveState === 'ALL_CLEARED' && this.entityCount === 0;
    }

    // Exit Door

    public get exitDoorActive(): boolean {
        return (this.mainView[BHMainViewSchema.EXIT_DOOR_ACTIVE] || 0) === 1;
    }

    public get exitDoorX(): number {
        return this.mainView[BHMainViewSchema.EXIT_DOOR_X] || 0;
    }

    public get exitDoorY(): number {
        return this.mainView[BHMainViewSchema.EXIT_DOOR_Y] || 0;
    }

    public get currentLevelIndex(): number {
        return Math.floor(this.mainView[BHMainViewSchema.CURRENT_LEVEL] || 0);
    }

    public get bossHp(): number {
        return this.mainView[BHMainViewSchema.BOSS_HP] || 0;
    }

    public get bossVulnerable(): boolean {
        return (this.mainView[BHMainViewSchema.BOSS_VULNERABLE] || 0) === 1;
    }

    public get bossPos() {
        return {
            x: this.mainView[BHMainViewSchema.BOSS_X] || 0,
            y: this.mainView[BHMainViewSchema.BOSS_Y] || 0
        };
    }

    public get bossActive(): boolean {
        return (this.mainView[BHMainViewSchema.BOSS_ACTIVE] || 0) === 1;
    }

    // Visuals

    public get heroVisuals() {
        return {
            x: this.mainView[BHMainViewSchema.HERO_X] || 0,
            y: this.mainView[BHMainViewSchema.HERO_Y] || 0,
            vx: this.mainView[BHMainViewSchema.HERO_VX] || 0,
            vy: this.mainView[BHMainViewSchema.HERO_VY] || 0,
            rotation: this.mainView[BHMainViewSchema.HERO_ROTATION] || 0,
            scale: this.mainView[BHMainViewSchema.HERO_SCALE] || 1,
            currentFrame: this.mainView[BHMainViewSchema.HERO_FRAME] || 0,
            mousePos: this.mainView[BHMainViewSchema.MOUSE_RELATIVE] || 0,
            width: this.mainView[BHMainViewSchema.HERO_WIDTH] || 0,
            height: this.mainView[BHMainViewSchema.HERO_HEIGHT] || 0,
        };
    }

    public getRockViewData(index: number) {
        const offset = index * BHRocksViewSchema.STRIDE;
        return {
            x: this.rocksView[offset] || 0,
            y: this.rocksView[offset + 1] || 0,
            rotation: this.rocksView[offset + 2] || 0,
            width: this.rocksView[offset + 6] || 0,
            height: this.rocksView[offset + 7] || 0,
        };
    }

    public getRockAttackData(index: number) {
        const offset = index * BHRocksViewSchema.STRIDE;
        return {
            primedMode: this.rocksView[offset + 3] || 0,
            endX: this.rocksView[offset + 4] || 0,
            endY: this.rocksView[offset + 5] || 0
        };
    }

    public getPlayerProjData(index: number) {
        const offset = index * BHPProjViewSchema.STRIDE;
        return {
            x: this.pProjsView[offset] || 0,
            y: this.pProjsView[offset + 1] || 0,
            width: this.pProjsView[offset + 2] || 0,
            height: this.pProjsView[offset + 3] || 0,
            seed: this.pProjsView[offset + 4] || 0,
        };
    }

    public getEnemyProjData(index: number) {
        const offset = index * BHEProjViewSchema.STRIDE;
        return {
            x: this.eProjsView[offset] || 0,
            y: this.eProjsView[offset + 1] || 0,
            width: this.eProjsView[offset + 2] || 0,
            height: this.eProjsView[offset + 3] || 0,
            seed: this.eProjsView[offset + 4] || 0,
        };
    }

    public get worldWidth(): number {
        return this.mainView[BHMainViewSchema.MAP_WIDTH] || 960;
    }

    public get worldHeight(): number {
        return this.mainView[BHMainViewSchema.MAP_HEIGHT] || 540;
    }
}