// src/features/Game4/model/Game4Config.ts
import levelData from '../../Game1/data/game1_levels.json';

export enum Game4Level {
    Level1 = "Level 1",
    Level2 = "Level 2",
    Level3 = "Level 3"
}

export interface Game4Config {
    width: number;
    height: number;
    initialHP: number;
    spawnCount: number;
    heroStartX: number;
    heroStartY: number;
    moveSpeed: number;
    manifestPath: string;
    bgmKey: string;
    levelLabel: string;
}

export const getGame4Config = (level: Game4Level): Game4Config => {
    const config = (levelData as Record<string, Game4Config>)[level];

    if (!config) {
        console.warn(`Config for ${level} not found, falling back to Level 1`);
        return (levelData as Record<string, Game4Config>)[Game4Level.Level1];
    }

    return config;
};