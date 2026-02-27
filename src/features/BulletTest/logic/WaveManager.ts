// src/features/BulletTest/logic/WaveManager.ts
import { IEnemySpawn, IContactEnemySpawn, IRangedEnemySpawn } from '../interfaces/IEnemy';
import { IWaveDefinition } from '../interfaces/IRoom';
import { BHConfig } from '../model/BHConfig';
import { baseEntity, RockEntity, ShotEntity } from '../interfaces/baseInterfaces/baseEntity';

export type WaveState = 'IDLE' | 'DELAY' | 'ACTIVE' | 'CLEARED' | 'ALL_CLEARED';

export class WaveManager {
    private waveDefinitions: IWaveDefinition[] = [];
    private currentWave: number = -1;
    private waveState: WaveState = 'IDLE';
    private delayTimer: number = 0;
    private totalWaves: number = 0;

    public loadWaves(waves: IWaveDefinition[]): void {
        this.waveDefinitions = waves;
        this.totalWaves = waves.length;
        this.currentWave = -1;
        this.waveState = 'IDLE';
        this.delayTimer = 0;
    }

    public start(): void {
        this.currentWave = 0;
        this.waveState = 'DELAY';
        this.delayTimer = this.waveDefinitions[0]?.delayBeforeStart ?? 60;
    }

    public update(activeEnemyCount: number): IEnemySpawn[] | null {
        if (this.waveState === 'IDLE' || this.waveState === 'ALL_CLEARED') {
            return null;
        }

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

        if (this.waveState === 'ACTIVE') {
            if (activeEnemyCount <= 0) {
                this.waveState = 'CLEARED';
            }
            return null;
        }

        if (this.waveState === 'CLEARED') {
            return null;
        }
        return null;
    }

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

    public static spawnFromDefinitions(
        spawns: IEnemySpawn[],
        config: BHConfig,
        waveIndex: number
    ): baseEntity[] {
        const entities: baseEntity[] = [];
        for (const spawn of spawns) {
            const x = spawn.spawnX * config.width;
            const y = spawn.spawnY * config.height;

            if (spawn.damageType === 'contact') {
                const contactSpawn = spawn as IContactEnemySpawn;
                const entity = new RockEntity(x, y);
                entity.applySpawnConfig(
                    contactSpawn.hp,
                    contactSpawn.moveSpeed,
                    contactSpawn.contactDamage,
                    waveIndex
                );
                entities.push(entity);
            } else if (spawn.damageType === 'ranged') {
                const rangedSpawn = spawn as IRangedEnemySpawn;
                const entity = new ShotEntity(x, y);
                entity.applySpawnConfig(
                    rangedSpawn.hp,
                    rangedSpawn.moveSpeed,
                    rangedSpawn.fireRate,
                    rangedSpawn.projectileDamage,
                    waveIndex
                );
                entities.push(entity);
            }
        }
        return entities;
    }

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