import React, { JSX } from 'react';
import { MenuState } from '../../../core/templates/MenuState';
import { FeatureEnum } from '../../FeatureEnum';
import { SettingsMenuController } from '../controllers/SettingsMenuController';
import { SettingsView } from '../views/SettingsView';

export class SettingsMenuState extends MenuState<SettingsMenuController> {
    public name = FeatureEnum.SETTINGS_MENU;
    private params: any;

    constructor(params?: any) {
        super(() => new SettingsMenuController());
        this.params = params;
    }

    public getView(): JSX.Element {
        return React.createElement(SettingsView, {
            controller: this.controller,
            res: this.params?.res,
            setRes: this.params?.setRes
        });
    }
}