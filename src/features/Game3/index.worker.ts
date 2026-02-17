// src/features/Game3/index.worker.ts
import { FeatureEnum } from "../FeatureEnum";
import { WorkerDefinition } from "../FeatureTypes";

export const Game3Worker: WorkerDefinition = {
    id: FeatureEnum.GAME_1,
    logicLoader: () => import("./logic/Game3Logic").then(m => m.Game3Logic),
    viewLoader: () => import("./view/Game3ViewLogic").then(m => m.Game3ViewLogic)
};