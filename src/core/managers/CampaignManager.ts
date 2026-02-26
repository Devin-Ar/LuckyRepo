// src/core/managers/CampaignManager.ts
// This in the long term beyond this class needs to handle branching and be a general flow manager, not just games.
import { SharedSession } from "../session/SharedSession";
import { CampaignRegistry } from "../registry/CampaignRegistry";
import { StateManager } from "./StateManager";
import { ICampaignDefinition } from "../interfaces/ICampaign";
import { StateRegistry } from "../registry/StateRegistry";
import { FeatureEnum } from "../../features/FeatureEnum";

export class CampaignManager {
    private static instance: CampaignManager;

    private constructor() {
    }

    public static getInstance(): CampaignManager {
        if (!CampaignManager.instance) {
            CampaignManager.instance = new CampaignManager();
        }
        return CampaignManager.instance;
    }

    public startCampaign(campaignId: string) {
        const def = CampaignRegistry.get(campaignId);
        if (!def) {
            console.error(`[CampaignManager] Could not find campaign: ${campaignId}`);
            return;
        }

        console.log(`[CampaignManager] Starting Campaign: ${campaignId}`);

        const session = SharedSession.getInstance();

        session.clearSavableKeys();

        session.set('campaign_id', campaignId);
        session.set('campaign_step_index', 0);

        this.loadCurrentStep(def, 0);
    }

    public completeCurrentStep() {
        const session = SharedSession.getInstance();
        const campaignId = session.get<string>('campaign_id');
        let index = session.get<number>('campaign_step_index');

        if (!campaignId || index === undefined) {
            this.quitCampaign();
            return;
        }

        const def = CampaignRegistry.get(campaignId);
        if (!def) return;

        index++;
        session.set('campaign_step_index', index);

        if (index >= def.steps.length) {
            this.quitCampaign();
        } else {
            this.loadCurrentStep(def, index);
        }
    }

    public retryCurrentStep() {
        const session = SharedSession.getInstance();
        const campaignId = session.get<string>('campaign_id');
        const index = session.get<number>('campaign_step_index');

        if (!campaignId || index === undefined) return;

        const def = CampaignRegistry.get(campaignId);
        if (!def) return;

        console.log(`[CampaignManager] Retrying step ${index}`);
        session.clearSavableKeys();

        session.set('campaign_id', campaignId);
        session.set('campaign_step_index', index);

        this.loadCurrentStep(def, index);
    }

    public failCurrentStep(context?: any) {
        const session = SharedSession.getInstance();
        const campaignId = session.get<string>('campaign_id');
        const index = session.get<number>('campaign_step_index');

        if (!campaignId) {
            console.error("No active campaign to fail.");
            this.quitCampaign();
            return;
        }

        const def = CampaignRegistry.get(campaignId);
        const step = def?.steps[index ?? -1];
        const factory = step?.failFactory || def?.failFactory;

        if (factory) {
            console.log(`[CampaignManager] Campaign Failed. Loading Fail State.`);
            const failState = factory(context);
            StateManager.getInstance().replace(failState);
        } else {
            console.warn("No failFactory defined for this campaign. Quitting.");
            this.quitCampaign();
        }
    }

    public quitCampaign() {
        const session = SharedSession.getInstance();
        session.clearSavableKeys();
        session.set('campaign_id', null);
        session.set('campaign_step_index', 0);

        console.log("[CampaignManager] Quitting to Menu.");
        StateManager.getInstance().replace(StateRegistry.create(FeatureEnum.DEV_MENU));
    }

    private async loadCurrentStep(def: ICampaignDefinition, index: number) {
        const step = def.steps[index];
        console.log(`[CampaignManager] Loading Step ${index}: ${step.name}`);

        const nextState = await StateRegistry.create(
            step.stateId,
            step.params || {},
            step.presetLabel
        );

        StateManager.getInstance().replace(nextState, step.loadingConfig);
    }
}