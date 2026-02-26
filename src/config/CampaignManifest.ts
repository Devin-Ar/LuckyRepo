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
        name: "Floor 1: The Gatehouse",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 1",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "The tower doors creak open. Creatures stir in the darkness beyond the threshold." }
        }
    },
    {
        name: "The Outer Wall",
        stateId: FeatureEnum.GAME_3,
        presetLabel: "LVL 1",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "You slip through a window onto the crumbling ramparts. The only way forward is up." }
        }
    },
    {
        name: "Floor 2: The Armory",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 2",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "Rusted blades line the walls. The tower's guardians grow fiercer the higher you climb." }
        }
    },
    {
        name: "The Bell Tower Ascent",
        stateId: FeatureEnum.GAME_3,
        presetLabel: "LVL 2",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Wind howls through broken stone. Ancient chains and beams offer treacherous footing." }
        }
    },
    {
        name: "Floor 3: The Sanctum",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 3",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "The air hums with old magic. Whatever rules this tower awaits in the chamber above." }
        }
    },
    {
        name: "The Summit",
        stateId: FeatureEnum.GAME_3,
        presetLabel: "LVL 3",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Moonlight breaks through the clouds. One final climb to the peak — or a long fall down." }
        }
    },
    {
        name: "The Core: Final Confrontation",
        stateId: FeatureEnum.BH_GAME,
        presetLabel: "LVL 4",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "The tower's true master waits at the very peak. Steel your resolve for the final wave." }
        }
    },
];

const MainMenuFlow: ICampaignStep[] = [
    {
        name: "Intro Splash",
        stateId: FeatureEnum.CINEMATIC,
        params: {
            imageName: "lucky_group",
            manifestPath: "res/cinematic_manifest.json"
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