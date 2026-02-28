// src/features/MainMenu/MainMenuState.ts
import React, { JSX } from 'react';
import { State } from '../../core/templates/State';
import { FeatureEnum } from '../FeatureEnum';
import { MainMenuController } from './MainMenuController';
import { MainMenuView } from './MainMenuView';
import { InputManager } from '../../core/managers/InputManager';
import { AudioManager } from "../../core/managers/AudioManager";
import { SpriteManager } from "../../core/managers/SpriteManager";

export class MainMenuState extends State {
    public name = FeatureEnum.MAIN_MENU;
    private readonly controller: MainMenuController;
    protected params: any;

    private readonly MANIFEST_PATH = "res/mainManifest.json";

    constructor(params?: any) {
        super();
        this.params = params || {};
        this.controller = new MainMenuController();
    }

    public async init(): Promise<void> {
        await AudioManager.getInstance().loadManifest(this.MANIFEST_PATH, this.name);
        await SpriteManager.getInstance().loadManifest(this.MANIFEST_PATH, this.name);
        InputManager.getInstance().refreshBindings("Shared");
        this.controller.init(this.name as FeatureEnum);
        this.controller.playBGM();
        this.isRendering = true;
    }

    public update(dt: number, frameCount: number): void {}

    public getView(): JSX.Element {
        return React.createElement(MainMenuView, {
            key: this.name,
            controller: this.controller,
            res: this.params.res,
            setRes: this.params.setRes
        });
    }

    public destroy(): void {
        this.controller.stopBGM();
        AudioManager.getInstance().uncacheByState(this.name);
        SpriteManager.getInstance().uncacheByState(this.name);
        this.controller.destroy();
    }
}