// src/features/Game3/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";
import {Game3Level} from "./model/Game3Config";

export const Game3Feature: StateDefinition = {
    id: FeatureEnum.GAME_3,
    displayName: "G3 Code Run",
    type: 'GAME',
    loader: () => import('./model/Game3State').then(m => m.Game3State),
    presets: [
        { label: "LVL 1", params: { level: Game3Level.Level1 } },
        { label: "LVL 2", params: { level: Game3Level.Level2 } },
        { label: "LVL 3", params: { level: Game3Level.Level3 } },
        { label: "LVL 4", params: { level: Game3Level.Level4 } }
    ]
};