// src/core/registry/StateRegistry.ts
import { IState } from "../interfaces/IState";

type StateConstructor = new (...args: any[]) => IState;

export class StateRegistry {
    private static states: Map<string, StateConstructor> = new Map();

    public static register(name: string, ctor: StateConstructor) {
        this.states.set(name, ctor);
    }

    public static get(name: string): StateConstructor | undefined {
        return this.states.get(name);
    }
}