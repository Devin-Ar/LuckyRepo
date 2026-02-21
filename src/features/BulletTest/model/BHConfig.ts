// src/features/Game1/model/Game1Config.ts
import levelData from '../data/game1_levels.json';

export enum BHLevel {
    Level1 = "Level 1",
    Level2 = "Level 2",
    Level3 = "Level 3",
    Level4 = "Level 4"
}

export interface BHConfig {
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

export const getBHConfig = (level: BHLevel): BHConfig => {
    const config = (levelData as Record<string, BHConfig>)[level];

    if (!config) {
        console.warn(`Config for ${level} not found, falling back to Level 1`);
        return (levelData as Record<string, BHConfig>)["Level 1"];    }

    return config;
};