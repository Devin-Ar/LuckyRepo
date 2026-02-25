// src/features/MainMenu/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";

export const MainMenuFeature: StateDefinition = {
    id: FeatureEnum.MAIN_MENU,
    displayName: "MAIN_MENU",
    type: 'MENU',
    loader: () => import('./MainMenuState').then(m => m.MainMenuState),
};