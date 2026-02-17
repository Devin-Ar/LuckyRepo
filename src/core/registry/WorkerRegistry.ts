// src/core/registry/WorkerRegistry.ts
export interface WorkerRegistryItem<T> {
    id: string;
    loader: () => Promise<new () => T>;
}

export class WorkerRegistry<T> {
    private loaders = new Map<string, () => Promise<new () => T>>();

    public register(def: WorkerRegistryItem<T>) {
        this.loaders.set(def.id, def.loader);
    }

    public async create(id: string): Promise<T> {
        const loader = this.loaders.get(id);
        if (!loader) {
            throw new Error(`WorkerRegistry: No loader registered for ID "${id}"`);
        }

        const ClassConstructor = await loader();
        return new ClassConstructor();
    }
}

export const LogicRegistry = new WorkerRegistry<any>();
export const ViewRegistry = new WorkerRegistry<any>();