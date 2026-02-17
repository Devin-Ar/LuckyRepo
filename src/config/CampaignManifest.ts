// src/config/CampaignDefinitions.ts
import { CampaignRegistry } from "../core/registry/CampaignRegistry";
import { ICampaignStep } from "../core/interfaces/ICampaign";
import { StateRegistry } from "../core/registry/StateRegistry";
import { FeatureEnum } from "../features/FeatureEnum";

import { DemoLoadingView } from "../components/loading/DemoLoadingView";
import { LoreLoadingView } from "../components/loading/LoreLoadingView";

const StoryCampaign: ICampaignStep[] = [
    {
        name: "Prologue: The Awakening",
        stateId: FeatureEnum.GAME_1,
        presetLabel: "LVL 1",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "System initializing. Hostiles detected in Sector 7. Engage immediately." }
        },
        failFactory: () => StateRegistry.create(FeatureEnum.GAME_OVER)
    },
    {
        name: "Chapter 1: The Descent",
        stateId: FeatureEnum.GAME_1,
        presetLabel: "LVL 2",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "Surface cleared. Descending into the sub-levels. Energy signatures rising." }
        }
    },
    {
        name: "Intermission: Resupply",
        stateId: FeatureEnum.GAME_2,
        presetLabel: "LVL 1",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Returning to Base..." }
        }
    }
];

const ArcadeCampaign: ICampaignStep[] = [
    {
        name: "Stage 1",
        stateId: FeatureEnum.GAME_2,
        presetLabel: "LVL 1",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Arcade Mode: Stage 1" }
        }
    },
    {
        name: "Stage 2",
        stateId: FeatureEnum.GAME_1,
        presetLabel: "LVL 3",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Arcade Mode: Stage 2" }
        }
    }
];

export const initializeCampaigns = () => {
    CampaignRegistry.register({
        id: "story_mode",
        steps: StoryCampaign,
        failFactory: () => StateRegistry.create(FeatureEnum.CONTINUE)
    });

    CampaignRegistry.register({
        id: "arcade_mode",
        steps: ArcadeCampaign,
        failFactory: () => StateRegistry.create(FeatureEnum.GAME_OVER)
    });
};