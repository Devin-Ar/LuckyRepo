// src/core/interfaces/IViewProps.ts
import {IController} from "./IController";
import {IPresenter} from "./IPresenter";

export interface IGameViewProps<T extends IPresenter, C extends IController> {
    vm: T;
    controller: C;
    width?: number;
    height?: number;
}