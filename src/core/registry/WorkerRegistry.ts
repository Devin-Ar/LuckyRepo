// src/core/registry/WorkerRegistry.ts
export interface WorkerDefinition<T> {
    id: string;
    factory: () => T;
}

export class WorkerRegistry<T> {
    private definitions = new Map<string, WorkerDefinition<T>>();

    public register(def: WorkerDefinition<T>) {
        this.definitions.set(def.id, def);
    }

    public create(id: string): T {
        const def = this.definitions.get(id);
        if (!def) {
            throw new Error(`WorkerRegistry: No factory registered for ID "${id}"`);
        }
        return def.factory();
    }
}

export const LogicRegistry = new WorkerRegistry<any>();
export const ViewRegistry = new WorkerRegistry<any>();