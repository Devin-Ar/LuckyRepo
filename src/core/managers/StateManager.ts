// src/core/managers/StateManager.ts
import {JSX} from "react";
import {IState} from '../interfaces/IState';
import {Engine} from '../Engine';
import {ILoadingConfig} from "../interfaces/ILoadingConfig";
import {LoadingState} from "../templates/LoadingState";

type StackListener = (views: JSX.Element[]) => void;

export class StateManager {
    private static instance: StateManager;
    private stack: IState[] = [];
    private listeners: StackListener[] = [];

    private constructor() {
    }

    public static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager();
        }
        return StateManager.instance;
    }


    public async push(state: IState, pauseLower: boolean = true) {
        if (pauseLower && this.stack.length > 0) {
            this.stack[this.stack.length - 1].isUpdating = false;
            this.stack[this.stack.length - 1].isRendering = true;
        }

        await state.init();
        this.stack.push(state);
        this.notify();
    }

    public pop() {
        if (this.stack.length <= 1) return; // Safeguard the root state

        const state = this.stack.pop();
        if (state) state.destroy();

        // Resume the lower state if it was paused
        if (this.stack.length > 0) {
            this.stack[this.stack.length - 1].isUpdating = true;
            this.stack[this.stack.length - 1].isRendering = true;
        }

        this.notify();
    }

    public async replace(promise: IState | Promise<IState>, loadingConfig?: ILoadingConfig) {
        this.stack.forEach(s => s.destroy());
        this.stack = [];

        this.notify();

        const state = await Promise.resolve(promise);

        const stateToLoad = loadingConfig ? new LoadingState(state, loadingConfig) : state;

        await stateToLoad.init();

        this.stack.push(stateToLoad);
        this.notify();

        Engine.getInstance().start();
    }

    public updateAll(dt: number, frameCount: number) {
        this.stack.forEach(state => {
            if (state.isUpdating) {
                state.update(dt, frameCount);
            }
        });
    }

    public getActiveUpdateStates(): IState[] {
        return this.stack.filter(s => s.isUpdating);
    }

    public getCurrentStateName(): string | null {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1].name : null;
    }

    public subscribe(fn: StackListener) {
        this.listeners.push(fn);
        this.notify();

        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    public getUnderlyingStateName(): string | null {
        if (this.stack.length === 0) return null;

        for (let i = this.stack.length - 1; i >= 0; i--) {
            const state = this.stack[i];
            if (state.name !== "PauseMenu" && state.name !== "SaveMenu" && state.name !== "SettingsMenu") {
                return state.name;
            }
        }
        return this.stack[0].name;
    }

    public getActiveState(): IState | null {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }

    private notify() {
        const views = this.stack
            .filter(s => s.isRendering)
            .map(s => s.getView());
        this.listeners.forEach(fn => fn(views));
    }
}