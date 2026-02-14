
// src/features/Game3/model/Game3Config.ts
import levelData from '../data/game3_levels.json';

export enum Game3Level {
    Level1 = "Level 1",
    Level2 = "Level 2",
    Level3 = "Level 3",
    Level4 = "Level 4"
}

export interface Game3Config {
    initialHP: number;
    manifestPath: string;
    bgmKey: string;
    mapPath?: string;
    mapScale?: number;
    heroWidth?: number;
    heroHeight?: number;
    playerScale?: number;
    playerOffsetY?: number;
    worldScale?: number;
}

export const getGame3Config = (level: Game3Level): Game3Config => {
    const config = (levelData as Record<string, Game3Config>)[level];
    if (!config) {
        console.warn(`[Game3Config] No config for "${level}", falling back to Level 1`);
        return (levelData as Record<string, Game3Config>)["Level 1"];
    }
    return config;
};