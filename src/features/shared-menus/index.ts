// src/features/shared-menus/index.ts
import { FeatureEnum } from "../FeatureEnum";
import { StateDefinition } from "../FeatureTypes";

export const SharedMenuFeatures: StateDefinition[] = [
    {
        id: FeatureEnum.PAUSE_MENU,
        displayName: "Paused",
        type: 'MENU',
        loader: () => import('./states/PauseMenuState').then(m => m.PauseMenuState),
    },
    {
        id: FeatureEnum.SAVE_MENU,
        displayName: "Storage",
        type: 'MENU',
        loader: () => import('./states/SaveMenuState').then(m => m.SaveMenuState),
    },
    {
        id: FeatureEnum.SETTINGS_MENU,
        displayName: "System Config",
        type: 'MENU',
        loader: () => import('./states/SettingsMenuState').then(m => m.SettingsMenuState),
    },
    {
        id: FeatureEnum.CONTINUE,
        displayName: "Continue",
        type: 'UTILITY',
        loader: () => import('./states/ContinueState').then(m => m.ContinueState),
    },
    {
        id: FeatureEnum.GAME_OVER,
        displayName: "Game Over",
        type: 'UTILITY',
        loader: () => import('./states/GameOverState').then(m => m.GameOverState),
    }
];