// src/features/Game2/index.worker.ts
import { FeatureEnum } from "../FeatureEnum";
import { WorkerDefinition } from "../FeatureTypes";

export const Game2Worker: WorkerDefinition = {
    id: FeatureEnum.GAME_2,
    logicLoader: () => import("./logic/Game2Logic").then(m => m.Game2Logic),
    viewLoader: () => import("./view/Game2ViewLogic").then(m => m.Game2ViewLogic)
};