// src/core/managers/CampaignManager.ts
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

        if (!campaignId) {
            console.error("No active campaign to fail.");
            this.quitCampaign();
            return;
        }

        // Read current points/coins from session (controllers sync these before calling fail)
        const points = session.get<number>('global_points') ?? 0;
        const coins = session.get<number>('global_coins') ?? 0;

        console.log(`[CampaignManager] Campaign Failed. Showing death score screen (pts=${points}, coins=${coins}).`);
        StateRegistry.create(FeatureEnum.SCORE_SCREEN, {
            points, coins, reason: 'death'
        }).then(state => {
            StateManager.getInstance().replace(state);
        });
    }

    public quitCampaign() {
        const session = SharedSession.getInstance();
        session.clearSavableKeys();
        session.set('campaign_id', null);
        session.set('campaign_step_index', 0);

        console.log("[CampaignManager] Quitting to Menu.");
        CampaignManager.getInstance().startCampaign('main_menu');
    }

    private async loadCurrentStep(def: ICampaignDefinition, index: number) {
        const step = def.steps[index];
        console.log(`[CampaignManager] Loading Step ${index}: ${step.name}`);

        // For victory score screen steps, inject current points/coins from session
        let finalParams = step.params || {};
        if (step.isVictoryScore) {
            const session = SharedSession.getInstance();
            const points = session.get<number>('global_points') ?? 0;
            const coins = session.get<number>('global_coins') ?? 0;
            finalParams = { ...finalParams, points, coins };
        }

        const nextState = await StateRegistry.create(
            step.stateId,
            finalParams,
            step.presetLabel
        );

        StateManager.getInstance().replace(nextState, step.loadingConfig);
    }
}