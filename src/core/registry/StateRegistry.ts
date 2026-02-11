// src/core/registry/StateRegistry.ts
import { State } from "../templates/State";
import { StateId } from "./StateId";

export interface StatePreset {
    label: string;
    params: any;
}

export interface StateDefinition {
    id: StateId;
    displayName: string;
    type: 'GAME' | 'MENU' | 'UTILITY';
    factory: (params?: any) => State;
    presets?: StatePreset[];
}

export class StateRegistry {
    private static states = new Map<string, StateDefinition>();

    public static register(def: StateDefinition) {
        this.states.set(def.id, def);
    }

    public static get(id: string | StateId): StateDefinition | undefined {
        return this.states.get(id);
    }

    public static create(id: string | StateId, params?: any): State {
        const def = this.get(id);
        if (!def) throw new Error(`StateRegistry: ID "${id}" not found.`);
        return def.factory(params);
    }

    public static getAllGames(): StateDefinition[] {
        return Array.from(this.states.values()).filter(s => s.type === 'GAME');
    }
}