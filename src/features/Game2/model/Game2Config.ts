// src/states/Game2/Game2Config.ts
import levelData from '../data/game2_levels.json';

export enum Game2Level {
    Level1 = "Level 1",
    Level2 = "Level 2",
    Level3 = "Level 3"
}

export interface Game2Config {
    initialHP: number;
    initialEnergy: number;
    initialScrap: number;
    maxEnergy: number;
    regenRate: number;
    manifestPath: string;
    bgmKey: string;
}

export const getGame2Config = (level: Game2Level): Game2Config => {
    const config = (levelData as Record<string, Game2Config>)[level];
    return config || (levelData as Record<string, Game2Config>)[Game2Level.Level1];
};