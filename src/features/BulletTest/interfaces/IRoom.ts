// src/features/BulletTest/interfaces/IRoom.ts
import { IPlayer } from './IPlayer';
import { IEnemy, IEnemySpawn } from './IEnemy';
import { IProjectile } from './IProjectile';

// Wave Definition
export interface IWaveDefinition {
    waveIndex: number;                  // 0, 1, or 2
    enemies: IEnemySpawn[];
    delayBeforeStart: number;           // frames to wait after previous wave cleared
}

// Room Configuration (static data, loaded from JSON)
export interface IRoomConfig {
    width: number;
    height: number;
    waves: [IWaveDefinition, IWaveDefinition, IWaveDefinition];
    playerStart: { x: number; y: number };
}

// Room State (live game state tracked in logic)
export interface IRoomState {
    currentWave: number;                // 0 | 1 | 2
    waveActive: boolean;
    waveCleared: boolean;
    roomCleared: boolean;
    framesSinceWaveClear: number;

    player: IPlayer;
    enemies: IEnemy[];
    projectiles: IProjectile[];
}