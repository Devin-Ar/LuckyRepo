// src/core/templates/MenuState.ts
import { JSX } from 'react';
import { State } from './State';
import { BaseMenuController } from './BaseMenuController';
import {FeatureEnum} from "../../features/FeatureEnum";

export abstract class MenuState<TController extends BaseMenuController> extends State {
    protected controller: TController;

    constructor(controllerFactory: () => TController) {
        super();
        this.controller = controllerFactory();
    }

    public async init(): Promise<void> {
        this.isRendering = true;
        this.controller.init(this.name as FeatureEnum);
    }

    public destroy(): void {
        this.controller.destroy();
    }

    public abstract getView(): JSX.Element;
}