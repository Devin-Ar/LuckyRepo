// src/features/shared-menus/states/PauseMenuState.ts
import React, { JSX } from 'react';
import { MenuState } from '../../../core/templates/MenuState';
import { StateId } from '../../../core/registry/StateId';
import { PauseMenuController } from '../controllers/PauseMenuController';
import { PauseView } from "../views/PauseView";

export class PauseMenuState extends MenuState<PauseMenuController> {
    public name = StateId.PAUSE_MENU;

    constructor() {
        super(() => new PauseMenuController());
    }

    public getView(): JSX.Element {
        return React.createElement(PauseView, {
            onResume: () => this.controller.onBack(),
            onSaveMenu: () => this.controller.onSave(),
            onSettings: () => this.controller.onSettings(),
            onQuit: () => this.controller.onQuit()
        });
    }
}