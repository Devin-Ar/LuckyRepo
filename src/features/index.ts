//src/features/index.ts
import { Game1Feature } from "./Game1";
import { Game2Feature } from "./Game2";
import { DevMenuFeature } from "./DevMenu";
import { MainMenuFeature } from "./MainMenu";
import { SharedMenuFeatures } from "./shared-menus";
import { StateDefinition } from "./FeatureTypes";
import {BHFeature} from "./BulletTest";
import {Game3Feature} from "./Game3";
import {CinematicFeature} from "./Cinematic";

export const UIFeatures: StateDefinition[] = [
    Game1Feature,
    Game2Feature,
    Game3Feature,
    BHFeature,
    MainMenuFeature,
    CinematicFeature,
    DevMenuFeature,
    ...SharedMenuFeatures
];