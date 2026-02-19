// src/features/Game1/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";
import { Game1Level } from "./model/Game1Config";

export const Game1Feature: StateDefinition = {
    id: FeatureEnum.GAME_1,
    displayName: "Operation: Descent",
    type: 'GAME',
    loader: () => import('./model/Game1State').then(m => m.Game1State),
    presets: [
        { label: "LVL 1", params: { level: Game1Level.Level1 } },
        { label: "LVL 2", params: { level: Game1Level.Level2 } },
        { label: "LVL 3", params: { level: Game1Level.Level3 } }
    ]
};