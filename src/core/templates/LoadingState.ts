// src/core/templates/LoadingState.ts
import React, {JSX} from "react";
import {State} from "./State";
import {ILoadingConfig} from "../interfaces/ILoadingConfig";
import {DefaultLoadingView} from "../../components/loading/DefaultLoadingView";
import {StateManager} from "../managers/StateManager";
import {SpriteManager} from "../managers/SpriteManager";
import {AudioManager} from "../managers/AudioManager";

export class LoadingState extends State {
    public name = "LoadingState";
    private isTargetReady = false;

    constructor(
        private targetState: State,
        private config: ILoadingConfig
    ) {
        super();
        this.isRendering = true;
    }

    public async init(): Promise<void> {
        if (this.config.manifestPath) {
            await Promise.all([
                SpriteManager.getInstance().loadManifest(this.config.manifestPath, this.name),
                AudioManager.getInstance().loadManifest(this.config.manifestPath, this.name)
            ]);
        }

        this.startTargetInit();
    }

    private async startTargetInit() {
        try {
            await this.targetState.init();

            this.isTargetReady = true;
            StateManager.getInstance()['notify']();
        } catch (e) {
            console.error("Failed to load target state:", e);
        }
    }

    public update(dt: number, frameCount: number): void {
    }

    public getView(): JSX.Element {
        const View = this.config.view || DefaultLoadingView;

        return React.createElement(View, {
            key: "loading-view",
            ...this.config.props,
            isFinished: this.isTargetReady,
            onTransitionComplete: () => this.finishLoading()
        });
    }

    private finishLoading() {
        StateManager.getInstance().replace(this.targetState);
    }

    public destroy(): void {
        SpriteManager.getInstance().uncacheByState(this.name);
        AudioManager.getInstance().uncacheByState(this.name);
    }
}