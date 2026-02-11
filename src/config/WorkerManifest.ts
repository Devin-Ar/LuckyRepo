// src/config/WorkerManifest.ts
import { StateId } from "../core/registry/StateId";
import { LogicRegistry, ViewRegistry } from "../core/registry/WorkerRegistry";

import { Game1Logic } from "../features/Game1/logic/Game1Logic";
import { Game2Logic } from "../features/Game2/logic/Game2Logic";

import { Game1ViewLogic } from "../features/Game1/view/Game1ViewLogic";
import { Game2ViewLogic } from "../features/Game2/view/Game2ViewLogic";

export const initializeWorkerRegistries = () => {
    LogicRegistry.register({
        id: StateId.GAME_1,
        factory: () => new Game1Logic()
    });
    LogicRegistry.register({
        id: StateId.GAME_2,
        factory: () => new Game2Logic()
    });

    ViewRegistry.register({
        id: StateId.GAME_1,
        factory: () => new Game1ViewLogic()
    });
    ViewRegistry.register({
        id: StateId.GAME_2,
        factory: () => new Game2ViewLogic()
    });
};