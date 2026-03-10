// src/core/campaign/ICampaign.ts
import { FeatureEnum } from "../../features/FeatureEnum";
import { ILoadingConfig } from "./ILoadingConfig";
import { State } from "../templates/State";

export interface ICampaignStep {
    name: string;
    stateId: FeatureEnum;
    presetLabel?: string;
    params?: any;
    loadingConfig?: ILoadingConfig;
    failFactory?: (context?: any) => State | Promise<State>;
    /** If true, this step is a victory score screen — points/coins are injected from session */
    isVictoryScore?: boolean;
}

export interface ICampaignDefinition {
    id: string;
    steps: ICampaignStep[];
    failFactory?: (context?: any) => State | Promise<State>;
}