// src/features/shared-menus/states/SaveMenuState.ts
import React, { JSX } from 'react';
import { MenuState } from '../../../core/templates/MenuState';
import { StateId } from '../../../core/registry/StateId';
import { SaveMenuController } from '../controllers/SaveMenuController';
import { SaveSlotView } from '../views/SaveSlotView';

export class SaveMenuState extends MenuState<SaveMenuController> {
    public name = StateId.SAVE_MENU;

    constructor() {
        super(() => new SaveMenuController());
    }

    public getView(): JSX.Element {
        return React.createElement(SaveSlotView, {
            activeStateName: this.controller.getActiveGameName(),
            onBack: () => this.controller.onBack(),
            onSave: (name) => this.controller.handleSave(name),
            onLoad: (name) => this.controller.handleLoad(name),
            onDelete: (name) => this.controller.handleDelete(name),
            onExport: (name) => this.controller.handleExport(name),
            onImport: (file) => this.controller.handleImport(file)
        });
    }
}