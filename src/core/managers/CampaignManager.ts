// src/core/managers/CampaignManager.ts
import {SharedSession} from "../session/SharedSession";
import {CampaignRegistry} from "../registry/CampaignRegistry";
import {StateManager} from "./StateManager";
import {ICampaignDefinition} from "../interfaces/ICampaign";
import {DevMenuState} from "../../features/DevMenu/DevMenuState";

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

        // Reset Session Data
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
            console.error("[CampaignManager] Cannot advance: No active campaign session.");
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

        if (!campaignId) {
            console.error("No active campaign to fail.");
            this.quitCampaign();
            return;
        }

        const def = CampaignRegistry.get(campaignId);

        if (def && def.failFactory) {
            console.log(`[CampaignManager] Campaign Failed. Loading Fail State.`);
            const failState = def.failFactory(context);
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
        StateManager.getInstance().replace(new DevMenuState());
    }

    private loadCurrentStep(def: ICampaignDefinition, index: number) {
        const step = def.steps[index];
        console.log(`[CampaignManager] Loading Step ${index}: ${step.name}`);

        const nextState = step.factory(step.config);

        StateManager.getInstance().replace(nextState, step.loadingConfig);
    }
}