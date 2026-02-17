// src/features/BulletTest/index.worker.ts
import { FeatureEnum } from "../FeatureEnum";
import { WorkerDefinition } from "../FeatureTypes";

export const BHWorker: WorkerDefinition = {
    id: FeatureEnum.BH_GAME,
    logicLoader: () => import("./logic/BHTestLogic").then(m => m.BHTestLogic),
    viewLoader: () => import("./view/BHViewLogic").then(m => m.BHViewLogic)
};