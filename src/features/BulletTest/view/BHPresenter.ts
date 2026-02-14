// src/features/BulletTest/view/BHPresenter.ts
import { BasePresenter } from "../../../core/templates/BasePresenter";
import { BHViewSchema } from "../model/BHViewSchema";

const WAVE_STATE_LABELS = ['IDLE', 'DELAY', 'ACTIVE', 'CLEARED', 'ALL_CLEARED'] as const;

export class BHPresenter extends BasePresenter {

    public get pos() {
        return {
            x: this.sharedView[BHViewSchema.HERO_X] || 0,
            y: this.sharedView[BHViewSchema.HERO_Y] || 0
        };
    }

    public get hp(): number {
        return this.sharedView[BHViewSchema.HERO_HP_DISPLAY] || 0;
    }

    public get entityCount(): number {
        return Math.floor(this.sharedView[BHViewSchema.ACTIVE_ROCK_COUNT] || 0);
    }

    public get projCount(): number {
        return Math.floor(this.sharedView[BHViewSchema.PPROJ_START_INDEX - 1] || 0);
    }

    // Wave state

    public get currentWave(): number {
        return Math.floor(this.sharedView[BHViewSchema.CURRENT_WAVE] || 0);
    }

    public get totalWaves(): number {
        return Math.floor(this.sharedView[BHViewSchema.TOTAL_WAVES] || 0);
    }

    public get waveState(): string {
        const idx = Math.floor(this.sharedView[BHViewSchema.WAVE_STATE] || 0);
        return WAVE_STATE_LABELS[idx] || 'IDLE';
    }

    public get waveDelayTimer(): number {
        return Math.floor(this.sharedView[BHViewSchema.WAVE_DELAY_TIMER] || 0);
    }

    public get isRoomCleared(): boolean {
        return this.waveState === 'ALL_CLEARED' && this.entityCount === 0;
    }

    // Exit Door

    public get exitDoorActive(): boolean {
        return (this.sharedView[BHViewSchema.EXIT_DOOR_ACTIVE] || 0) === 1;
    }

    public get exitDoorX(): number {
        return this.sharedView[BHViewSchema.EXIT_DOOR_X] || 0;
    }

    public get exitDoorY(): number {
        return this.sharedView[BHViewSchema.EXIT_DOOR_Y] || 0;
    }

    public get currentLevelIndex(): number {
        return Math.floor(this.sharedView[BHViewSchema.CURRENT_LEVEL] || 0);
    }

    // --- Visuals ---

    public get heroVisuals() {
        return {
            x: this.sharedView[BHViewSchema.HERO_X] || 0,
            y: this.sharedView[BHViewSchema.HERO_Y] || 0,
            rotation: this.sharedView[BHViewSchema.HERO_ROTATION] || 0,
            scale: this.sharedView[BHViewSchema.HERO_SCALE] || 1,
            currentFrame: this.sharedView[BHViewSchema.HERO_FRAME] || 0
        };
    }

    public getRockViewData(index: number) {
        const offset = BHViewSchema.ROCKS_START_INDEX + (index * BHViewSchema.ROCK_STRIDE);
        return {
            x: this.sharedView[offset] || 0,
            y: this.sharedView[offset + 1] || 0,
            rotation: this.sharedView[offset + 2] || 0
        };
    }

    public getRockAttackData(index: number) {
        const offset = BHViewSchema.ROCKS_START_INDEX + (index * BHViewSchema.ROCK_STRIDE);
        return {
            primedMode: this.sharedView[offset + 3] || 0,
            endX: this.sharedView[offset + 4] || 0,
            endY: this.sharedView[offset + 5] || 0
        };
    }

    public getPlayerProjData(index: number) {
        const offset = BHViewSchema.PPROJ_START_INDEX + (index * BHViewSchema.PPROJ_STRIDE);
        return {
            x: this.sharedView[offset] || 0,
            y: this.sharedView[offset + 1] || 0,
        };
    }
}