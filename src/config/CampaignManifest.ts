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

const CrossGameCampaign: ICampaignStep[] = [
    {
        name: "Floor 1: The Gatehouse",
        factory: (cfg) => StateRegistry.create(StateId.BH_GAME, { level: cfg }),
        config: "Level 1",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "The tower doors creak open. Creatures stir in the darkness beyond the threshold." }
        }
    },
    {
        name: "The Outer Wall",
        factory: (cfg) => StateRegistry.create(StateId.GAME_3, { level: cfg }),
        config: "Level 1",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "You slip through a window onto the crumbling ramparts. The only way forward is up." }
        }
    },
    {
        name: "Floor 2: The Armory",
        factory: (cfg) => StateRegistry.create(StateId.BH_GAME, { level: cfg }),
        config: "Level 2",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "Rusted blades line the walls. The tower's guardians grow fiercer the higher you climb." }
        }
    },
    {
        name: "The Bell Tower Ascent",
        factory: (cfg) => StateRegistry.create(StateId.GAME_3, { level: cfg }),
        config: "Level 2",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Wind howls through broken stone. Ancient chains and beams offer treacherous footing." }
        }
    },
    {
        name: "Floor 3: The Sanctum",
        factory: (cfg) => StateRegistry.create(StateId.BH_GAME, { level: cfg }),
        config: "Level 3",
        loadingConfig: {
            view: LoreLoadingView,
            props: { message: "The air hums with old magic. Whatever rules this tower awaits in the chamber above." }
        }
    },
    {
        name: "The Summit",
        factory: (cfg) => StateRegistry.create(StateId.GAME_3, { level: cfg }),
        config: "Level 3",
        loadingConfig: {
            view: DemoLoadingView,
            props: { message: "Moonlight breaks through the clouds. One final climb to the peak — or a long fall down." }
        }
    },
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

    CampaignRegistry.register({
        id: "cross_game",
        steps: CrossGameCampaign,
        failFactory: () => StateRegistry.create(StateId.CONTINUE)
    });
};