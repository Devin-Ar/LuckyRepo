// src/core/registry/CampaignRegistry.ts
import { ICampaignDefinition } from "../interfaces/ICampaign";

export class CampaignRegistry {
    private static campaigns: Map<string, ICampaignDefinition> = new Map();

    public static register(campaign: ICampaignDefinition) {
        this.campaigns.set(campaign.id, campaign);
    }

    public static get(id: string): ICampaignDefinition | undefined {
        return this.campaigns.get(id);
    }

    public static getAll(): ICampaignDefinition[] {
        return Array.from(this.campaigns.values());
    }
}