// src/features/DevMenu/DevMenuState.ts
import React, { JSX } from 'react';
import { State } from '../../core/templates/State';
import { FeatureEnum } from '../FeatureEnum';
import { DevMenuController } from './DevMenuController';
import { DevMenuView } from './DevMenuView';

export class DevMenuState extends State {
    public name = FeatureEnum.DEV_MENU;
    private controller: DevMenuController;
    protected params: any;

    constructor(params?: any) {
        super();
        this.params = params || {};
        this.controller = new DevMenuController();
    }

    public async init(): Promise<void> {
        this.isRendering = true;
        this.controller.init(this.name as FeatureEnum);
    }

    public update(dt: number, frameCount: number): void {
    }

    public getView(): JSX.Element {
        return React.createElement(DevMenuView, {
            key: this.name,
            controller: this.controller,
            res: this.params.res,
            setRes: this.params.setRes
        });
    }

    public destroy(): void {
        this.controller.destroy();
    }
}