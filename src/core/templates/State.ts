import {JSX} from "react";
import {IState} from "../interfaces/IState";

export abstract class State implements IState {
    public abstract name: string;
    public isUpdating = false;
    public isRendering = false;
    public priority = 0;
    public isInitialized = false;

    abstract init(): Promise<void>;

    public update(dt: number, frameCount: number): void {
    }

    abstract getView(): JSX.Element;

    abstract destroy(): void;
}