//src/core/interfaces/IState.ts
import {JSX} from "react";

export interface IState {
    name: string;
    isUpdating: boolean;
    isRendering: boolean;
    priority: number;
    isInitialized: boolean;

    init(): Promise<void>;

    update(dt: number, frameCount: number): void;

    getView(): JSX.Element;

    destroy(): void;
}