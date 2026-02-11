// src/config/StateManifest.ts
import {StateRegistry} from "../core/registry/StateRegistry";
import {StateId} from "../core/registry/StateId";

import {Game1State} from "../features/Game1/model/Game1State";
import {Game1Level} from "../features/Game1/model/Game1Config";
import {Game2State} from "../features/Game2/model/Game2State";
import {Game2Level} from "../features/Game2/model/Game2Config";
import {DevMenuState} from "../features/DevMenu/DevMenuState";
import {PauseMenuState} from "../features/shared-menus/states/PauseMenuState";
import {SaveMenuState} from "../features/shared-menus/states/SaveMenuState";
import {SettingsMenuState} from "../features/shared-menus/states/SettingsMenuState";
import {ContinueState} from "../features/shared-menus/states/ContinueState";
import {GameOverState} from "../features/shared-menus/states/GameOverState";

export const initializeStateRegistry = () => {
    StateRegistry.register({
        id: StateId.GAME_1,
        displayName: "Operation: Descent",
        type: 'GAME',
        factory: (p) => new Game1State(p?.reset ?? false, p?.level ?? Game1Level.Level1),
        presets: [
            { label: "LVL 1", params: { level: Game1Level.Level1 } },
            { label: "LVL 2", params: { level: Game1Level.Level2 } },
            { label: "LVL 3", params: { level: Game1Level.Level3 } }
        ]
    });

    StateRegistry.register({
        id: StateId.GAME_2,
        displayName: "Supply Run",
        type: 'GAME',
        factory: (p) => new Game2State(p?.reset ?? false, p?.level ?? Game2Level.Level1),
        presets: [
            { label: "LVL 1", params: { level: Game2Level.Level1 } },
            { label: "LVL 2", params: { level: Game2Level.Level2 } },
            { label: "LVL 3", params: { level: Game2Level.Level3 } }
        ]
    });

    StateRegistry.register({
        id: StateId.DEV_MENU,
        displayName: "Switchboard",
        type: 'MENU',
        factory: () => new DevMenuState()
    });

    StateRegistry.register({
        id: StateId.PAUSE_MENU,
        displayName: "Paused",
        type: 'MENU',
        factory: () => new PauseMenuState()
    });

    StateRegistry.register({
        id: StateId.SAVE_MENU,
        displayName: "Storage",
        type: 'MENU',
        factory: () => new SaveMenuState()
    });

    StateRegistry.register({
        id: StateId.SETTINGS_MENU,
        displayName: "System Config",
        type: 'MENU',
        factory: (p) => new SettingsMenuState(p)
    });

    StateRegistry.register({
        id: StateId.CONTINUE,
        displayName: "Continue",
        type: 'UTILITY',
        factory: () => new ContinueState()
    });
    StateRegistry.register({
        id: StateId.GAME_OVER,
        displayName: "Game Over",
        type: 'UTILITY',
        factory: () => new GameOverState()
    });
};