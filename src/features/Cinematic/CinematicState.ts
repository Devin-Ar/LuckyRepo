// src/features/Cinematic/CinematicState.ts
import React, { JSX } from 'react';
import { State } from '../../core/templates/State';
import { FeatureEnum } from '../FeatureEnum';
import { CinematicController } from './CinematicController';
import { CinematicView } from './CinematicView';
import {SpriteManager} from "../../core/managers/SpriteManager";
import {InputManager} from "../../core/managers/InputManager";

export class CinematicState extends State {
    public name = FeatureEnum.CINEMATIC;
    private controller: CinematicController;
    private params: any;

    constructor(params?: any) {
        super();
        this.params = params || {};
        this.controller = new CinematicController();
    }

    public async init(): Promise<void> {
        if (this.params.manifestPath) {
            await Promise.all([
                SpriteManager.getInstance().loadManifest(this.params.manifestPath, this.name)
            ]);
        }
        InputManager.getInstance().refreshBindings(this.name);
        this.isRendering = true;
        this.controller.init(this.name as FeatureEnum);
    }

    public update(dt: number): void {}

    public getView(): JSX.Element {
        return React.createElement(CinematicView, {
            key: this.name,
            controller: this.controller,
            imageName: this.params.imageName,
        });
    }

    public destroy(): void {
        InputManager.getInstance().refreshBindings(this.name);
        this.controller.destroy();
    }
}