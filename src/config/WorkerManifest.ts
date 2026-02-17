// src/config/WorkerManifest.ts
import { LogicRegistry, ViewRegistry } from "../core/registry/WorkerRegistry";
import { WorkerFeatures } from "../features/workers";

export const initializeWorkerRegistries = () => {
    WorkerFeatures.forEach(def => {
        if (def.logicLoader) {
            LogicRegistry.register({ id: def.id, loader: def.logicLoader });
        }
        if (def.viewLoader) {
            ViewRegistry.register({ id: def.id, loader: def.viewLoader });
        }
    });
};