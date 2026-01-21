// src/features/shared-menus/states/SettingsMenuState.ts
import React, { JSX } from 'react';
import { MenuState } from '../../../core/templates/MenuState';
import { SettingsView } from '../views/SettingsView';

export class SettingsMenuState extends MenuState {
    public name = "SettingsMenu";

    constructor(private props?: any) {
        super();
    }

    public getView(): JSX.Element {
        return React.createElement(SettingsView, {
            onBack: () => this.onClose(),
            res: this.props?.res,
            setRes: this.props?.setRes
        });
    }
}