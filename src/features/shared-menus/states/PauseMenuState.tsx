// src/features/shared-menus/states/PauseMenuState.ts
import React, { JSX } from 'react';
import { StateManager } from '../../../core/managers/StateManager';
import { MenuState } from '../../../core/templates/MenuState';
import { DevMenuState } from '../../DevMenu/DevMenuState';
import { SettingsMenuState } from "./SettingsMenuState";
import { PauseView } from "../views/PauseView";
import {SaveMenuState} from "./SaveMenuState";

export class PauseMenuState extends MenuState {
    public name = "PauseMenu";

    public getView(): JSX.Element {
        return React.createElement(PauseView, {
            onResume: () => this.onClose(),
            onSaveMenu: () => StateManager.getInstance().push(new SaveMenuState()),
            onSettings: () => StateManager.getInstance().push(new SettingsMenuState()),
            onQuit: () => {
                const target = new DevMenuState();
                const config = (DevMenuState as any).loadingConfig || {};
                // Pop the pause menu off before replacing the underlying game state
                StateManager.getInstance().pop();
                StateManager.getInstance().replace(target);
            }
        });
    }
}