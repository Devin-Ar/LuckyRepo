// src/core/registry/StateRegistry.ts
import { State } from "../templates/State";
import { FeatureEnum } from "../../features/FeatureEnum";
import { StateDefinition } from "../../features/FeatureTypes";

export interface StatePreset {
    label: string;
    params: any;
}

export class StateRegistry {
    private static states = new Map<string, StateDefinition>();

    public static register(def: StateDefinition) {
        this.states.set(def.id, def);
    }

    public static get(id: string | FeatureEnum): StateDefinition | undefined {
        return this.states.get(id);
    }

    public static async create(id: string | FeatureEnum, params?: any): Promise<State> {
        const def = this.get(id);
        if (!def) throw new Error(`StateRegistry: ID "${id}" not found.`);
        const StateClass = await def.loader();
        return new StateClass(params);
    }

    public static async createFromPreset(id: FeatureEnum, presetLabel: string): Promise<State> {
        const def = this.get(id);
        if (!def) throw new Error(`StateRegistry: ID "${id}" not found.`);

        const preset = def.presets?.find(p => p.label === presetLabel);
        if (!preset) {
            throw new Error(`StateRegistry: Preset "${presetLabel}" not found for ID "${id}".`);
        }

        const StateClass = await def.loader();
        return new StateClass(preset.params);
    }

    public static getAllGames(): StateDefinition[] {
        return Array.from(this.states.values()).filter(s => s.type === 'GAME');
    }
}