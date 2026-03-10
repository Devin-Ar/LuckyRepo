// src/config/CampaignDefinitions.ts
import { CampaignRegistry } from "../core/registry/CampaignRegistry";
import { ICampaignStep } from "../core/interfaces/ICampaign";
import { StateRegistry } from "../core/registry/StateRegistry";
import { FeatureEnum } from "../features/FeatureEnum";

import { DemoLoadingView } from "../components/loading/DemoLoadingView";
import { LoreLoadingView } from "../components/loading/LoreLoadingView";
import {DefaultLoadingView} from "../components/loading/DefaultLoadingView";

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

const CrossGameCampaign: ICampaignStep[] = [
    {
        name: "Level 1",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 1",
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Level 2",
        stateId: FeatureEnum.GAME_3,
        presetLabel: "LVL 1",
        params: {
            backgroundKey: "Game3BG1"
        },
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Level 3",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 2",
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Level 4",
        stateId: FeatureEnum.GAME_3,
        presetLabel: "LVL 2",
        params: {
            backgroundKey: "Game3BG2"
        },
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Level 5",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 3",
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Level 6",
        stateId: FeatureEnum.GAME_3,
        presetLabel: "LVL 3",
        params: {
            backgroundKey: "Game3BG3"
        },
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Level 7",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 4",
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "End Screen",
        stateId: FeatureEnum.CINEMATIC,
        params: {
            imageName: "end",
            manifestPath: "res/cinematic_manifest.json"
        },
        loadingConfig: {
            view: DemoLoadingView,
        }
    },
    {
        name: "Final Score",
        stateId: FeatureEnum.SCORE_SCREEN,
        isVictoryScore: true,
        params: {
            reason: 'victory'
        },
    },
];

const MainMenuFlow: ICampaignStep[] = [
    {
        name: "Intro Splash",
        stateId: FeatureEnum.CINEMATIC,
        params: {
            imageName: "lucky_group",
            manifestPath: "res/cinematic_manifest.json"
        },
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "Click the Button to Start." }
        }
    },
    {
        name: "Main Menu",
        stateId: FeatureEnum.MAIN_MENU,
    },
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

    CampaignRegistry.register({
        id: "cross_game",
        steps: CrossGameCampaign,
        failFactory: () => StateRegistry.create(FeatureEnum.CONTINUE)
    });

    CampaignRegistry.register({
        id: "main_menu",
        steps: MainMenuFlow,
    });
};