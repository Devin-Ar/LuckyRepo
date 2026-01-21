// src/features/Game1/model/Game1Config.ts
import levelData from '../data/game1_levels.json';

export enum Game1Level {
    Level1 = "Level 1",
    Level2 = "Level 2",
    Level3 = "Level 3"
}

export interface Game1Config {
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

export const getGame1Config = (level: Game1Level): Game1Config => {
    const config = (levelData as Record<string, Game1Config>)[level];

    if (!config) {
        console.warn(`Config for ${level} not found, falling back to Level 1`);
        return (levelData as Record<string, Game1Config>)[Game1Level.Level1];
    }

    return config;
};