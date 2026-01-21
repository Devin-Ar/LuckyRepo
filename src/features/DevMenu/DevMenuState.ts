// src/features/DevMenu/DevMenuState.ts
import React, {JSX} from 'react';
import {State} from '../../core/templates/State';
import {StateManager} from '../../core/managers/StateManager';
import {DevMenuView} from './DevMenuView';

export class DevMenuState extends State {
    public name = "DevMenu";

    public async init(): Promise<void> {
        this.isRendering = true;
    }

    public update(dt: number, frameCount: number): void {
    }

    public getView(): JSX.Element {
        return React.createElement(DevMenuView, {
            key: this.name,
            onNavigate: (StateClass: any, ...args: any[]) => {
                const target = new StateClass(...args);
                StateManager.getInstance().replace(target);
            }
        });
    }

    public destroy(): void {
    }
}