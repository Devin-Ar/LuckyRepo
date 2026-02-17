// src/features/Game1/index.worker.ts
import { FeatureEnum } from "../FeatureEnum";
import { WorkerDefinition } from "../FeatureTypes";

export const Game1Worker: WorkerDefinition = {
    id: FeatureEnum.GAME_1,
    logicLoader: () => import("./logic/Game1Logic").then(m => m.Game1Logic),
    viewLoader: () => import("./view/Game1ViewLogic").then(m => m.Game1ViewLogic)
};