//src/features/workers.ts
import { WorkerDefinition } from "./FeatureTypes";
import { Game1Worker } from "./Game1/index.worker";
import { Game2Worker } from "./Game2/index.worker";
import {BHWorker} from "./BulletTest/index.worker";
import {Game3Worker} from "./Game3/index.worker";

export const WorkerFeatures: WorkerDefinition[] = [
    Game1Worker,
    Game2Worker,
    Game3Worker,
    BHWorker
];