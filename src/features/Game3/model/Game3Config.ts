// src/features/Game3/model/Game3Config.ts
import levelData from '../data/game3_levels.json';

export enum Game3Level {
    Level1 = "Level 1",
    Level2 = "Level 2",
    Level3 = "Level 3"
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
    return config || (levelData as Record<string, Game3Config>)[Game3Level.Level1];
};
