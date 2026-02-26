// src/features/DevMenu/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";

export const CinematicFeature: StateDefinition = {
    id: FeatureEnum.CINEMATIC,
    displayName: "Cinematic",
    type: 'MENU',
    loader: () => import('./CinematicState').then(m => m.CinematicState),
};