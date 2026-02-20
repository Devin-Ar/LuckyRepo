// src/features/BulletTest/logic/WaveManager.ts
import { IEnemySpawn } from '../interfaces/IEnemy';
import { IWaveDefinition } from '../interfaces/IRoom';
import { BHConfig } from '../model/BHConfig';
import {baseEntity, RockEntity, ShotEntity} from '../interfaces/baseInterfaces/baseEntity';

export type WaveState = 'IDLE' | 'DELAY' | 'ACTIVE' | 'CLEARED' | 'ALL_CLEARED';

export class WaveManager {
    private waveDefinitions: IWaveDefinition[] = [];
    private currentWave: number = -1;     // -1 means not started
    private waveState: WaveState = 'IDLE';
    private delayTimer: number = 0;
    private totalWaves: number = 0;

    /**
     * Load wave definitions from parsed JSON data.
     * Call this once after config is applied.
     */
    public loadWaves(waves: IWaveDefinition[]): void {
        this.waveDefinitions = waves;
        this.totalWaves = waves.length;
        this.currentWave = -1;
        this.waveState = 'IDLE';
        this.delayTimer = 0;
    }

    /**
     * Start the first wave (or restart from wave 0).
     */
    public start(): void {
        this.currentWave = 0;
        this.waveState = 'DELAY';
        this.delayTimer = this.waveDefinitions[0]?.delayBeforeStart ?? 60;
    }

    /**
     * Call every frame from the logic update.
     * Returns a list of enemies to spawn when a new wave begins, or null otherwise.
     */
    public update(activeEnemyCount: number): IEnemySpawn[] | null {
        if (this.waveState === 'IDLE' || this.waveState === 'ALL_CLEARED') {
            return null;
        }

        // DELAY phase: count down before spawning next wave
        if (this.waveState === 'DELAY') {
            this.delayTimer--;
            if (this.delayTimer <= 0) {
                this.waveState = 'ACTIVE';
                const waveDef = this.waveDefinitions[this.currentWave];
                if (waveDef) {
                    return waveDef.enemies;
                }
            }
            return null;
        }

        // ACTIVE phase: wait for all enemies to be eliminated
        if (this.waveState === 'ACTIVE') {
            if (activeEnemyCount <= 0) {
                this.waveState = 'CLEARED';
            }
            return null;
        }

        // CLEARED phase: advance to next wave or finish
        if (this.waveState === 'CLEARED') {
            return null; // Logic will handle transitioning out of CLEARED
        }
        return null;
    }

    /**
     * Move to next wave manually (used by logic when boss is ready)
     */
    public nextWave(): void {
        if (this.waveState !== 'CLEARED') return;
        
        if (this.currentWave + 1 >= this.totalWaves) {
            this.waveState = 'ALL_CLEARED';
        } else {
            this.currentWave++;
            this.waveState = 'DELAY';
            this.delayTimer = this.waveDefinitions[this.currentWave]?.delayBeforeStart ?? 60;
        }
    }

    /**
     * Spawn entities from spawn definitions.
     * spawnX/spawnY are 0-1 normalized, multiplied by config width/height.
     */
    public static spawnFromDefinitions(
        spawns: IEnemySpawn[],
        config: BHConfig
    ): baseEntity[] {
        const entities: baseEntity[] = [];
        for (const spawn of spawns) {
            const x = spawn.spawnX * config.width;
            const y = spawn.spawnY * config.height;

            // Currently only contact enemies use RockEntity
            // When ranged enemies are added, switch on spawn.damageType
            let entity;
            if (Math.random() > 0.5) {
                entity = new ShotEntity(x, y);
            } else {
                entity = new RockEntity(x, y);
            }

            // Apply per-enemy config from the wave definition
            entity.health = spawn.hp;
            if ('moveSpeed' in spawn) {
                (entity as any)._waveSpeed = spawn.moveSpeed;
            }
            if ('contactDamage' in spawn && spawn.damageType === 'contact') {
                (entity as any)._contactDamage = spawn.contactDamage;
            }

            entities.push(entity);
        }
        return entities;
    }

    // Getters for SAB sync

    public getCurrentWave(): number {
        return Math.max(0, this.currentWave);
    }

    public getTotalWaves(): number {
        return this.totalWaves;
    }

    public getState(): WaveState {
        return this.waveState;
    }

    public getDelayTimer(): number {
        return this.delayTimer;
    }

    public isAllCleared(): boolean {
        return this.waveState === 'ALL_CLEARED';
    }

    // Snapshot support

    public getSnapshot(): any {
        return {
            currentWave: this.currentWave,
            waveState: this.waveState,
            delayTimer: this.delayTimer,
            totalWaves: this.totalWaves
        };
    }

    public loadSnapshot(data: any): void {
        if (!data) return;
        this.currentWave = data.currentWave ?? -1;
        this.waveState = data.waveState ?? 'IDLE';
        this.delayTimer = data.delayTimer ?? 0;
        this.totalWaves = data.totalWaves ?? 0;
    }
}