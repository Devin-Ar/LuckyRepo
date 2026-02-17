// src/features/BulletTest/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";
import { BHLevel } from "./model/BHConfig";

export const BHFeature: StateDefinition = {
    id: FeatureEnum.BH_GAME,
    displayName: "Operation: Descent",
    type: 'GAME',
    loader: () => import('./model/BHState').then(m => m.BHState),
    presets: [
        { label: "LVL 1", params: { level: BHLevel.Level1 } },
        { label: "LVL 2", params: { level: BHLevel.Level2 } },
        { label: "LVL 3", params: { level: BHLevel.Level3 } }
    ]
};