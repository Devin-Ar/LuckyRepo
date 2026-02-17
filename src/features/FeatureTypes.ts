//src/features/FeatureTypes.ts
import { FeatureEnum } from "./FeatureEnum";
import type { State } from "../core/templates/State";
import type { StatePreset } from "../core/registry/StateRegistry";

type StateConstructor = new (params?: any) => State;
type LogicConstructor = new () => any;

export interface StateDefinition {
    id: FeatureEnum;
    displayName: string;
    type: 'GAME' | 'MENU' | 'UTILITY';
    loader: () => Promise<StateConstructor>;
    presets?: StatePreset[];
}

export interface WorkerDefinition {
    id: FeatureEnum;
    logicLoader?: () => Promise<LogicConstructor>;
    viewLoader?: () => Promise<LogicConstructor>;
}