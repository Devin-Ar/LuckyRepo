// src/core/campaign/ICampaign.ts
import { IState } from "./IState";
import { ILoadingConfig } from "./ILoadingConfig";

export type StateFactory<TConfig = any> = (config: TConfig) => IState;

export interface ICampaignStep {
    name: string;
    factory: StateFactory;
    config: any;
    loadingConfig?: ILoadingConfig;
}

export interface ICampaignDefinition {
    id: string;
    steps: ICampaignStep[];
    failFactory?: (context?: any) => IState;
}