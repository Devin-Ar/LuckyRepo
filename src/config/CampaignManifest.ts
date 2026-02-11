// src/config/CampaignDefinitions.ts
import { CampaignRegistry } from "../core/registry/CampaignRegistry";
import { ICampaignStep } from "../core/interfaces/ICampaign";
import { StateRegistry } from "../core/registry/StateRegistry";
import { StateId } from "../core/registry/StateId";

import { DemoLoadingView } from "../components/loading/DemoLoadingView";
import { LoreLoadingView } from "../components/loading/LoreLoadingView";

const StoryCampaign: ICampaignStep[] = [
    {
        name: "Prologue: The Awakening",
        factory: (cfg) => StateRegistry.create(StateId.GAME_1, { level: cfg }),
        config: "Level 1",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "System initializing. Hostiles detected in Sector 7. Engage immediately." }
        }
    },
    {
        name: "Chapter 1: The Descent",
        factory: (cfg) => StateRegistry.create(StateId.GAME_1, { level: cfg }),
        config: "Level 2",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "Surface cleared. Descending into the sub-levels. Energy signatures rising." }
        }
    },
    {
        name: "Intermission: Resupply",
        factory: (cfg) => StateRegistry.create(StateId.GAME_2, { level: cfg }),
        config: "Level 1",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Returning to Base..." }
        }
    }
];

const ArcadeCampaign: ICampaignStep[] = [
    {
        name: "Stage 1",
        factory: (cfg) => StateRegistry.create(StateId.GAME_2, { level: cfg }),
        config: "Level 1",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Arcade Mode: Stage 1" }
        }
    },
    {
        name: "Stage 2",
        factory: (cfg) => StateRegistry.create(StateId.GAME_1, { level: cfg }),
        config: "Level 3",
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
        failFactory: () => StateRegistry.create(StateId.CONTINUE)
    });

    CampaignRegistry.register({
        id: "arcade_mode",
        steps: ArcadeCampaign,
        failFactory: () => StateRegistry.create(StateId.GAME_OVER)
    });
};