// src/features/DevMenu/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";

export const DevMenuFeature: StateDefinition = {
    id: FeatureEnum.DEV_MENU,
    displayName: "Switchboard",
    type: 'MENU',
    loader: () => import('./DevMenuState').then(m => m.DevMenuState),
};