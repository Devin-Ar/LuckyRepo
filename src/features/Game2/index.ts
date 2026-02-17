// src/features/Game2/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";
import { Game2Level } from "./model/Game2Config";

export const Game2Feature: StateDefinition = {
    id: FeatureEnum.GAME_2,
    displayName: "Supply Run",
    type: 'GAME',
    loader: () => import('./model/Game2State').then(m => m.Game2State),
    presets: [
        { label: "LVL 1", params: { level: Game2Level.Level1 } },
        { label: "LVL 2", params: { level: Game2Level.Level2 } },
        { label: "LVL 3", params: { level: Game2Level.Level3 } }
    ]
};