// src/features/DevMenu/DevMenuController.ts
import { BaseMenuController } from "../../core/templates/BaseMenuController";
import { StateManager } from "../../core/managers/StateManager";
import { StateRegistry } from "../../core/registry/StateRegistry";
import { StateId } from "../../core/registry/StateId";
import { SharedSession } from "../../core/session/SharedSession";
import { AudioManager } from "../../core/managers/AudioManager";
import { CampaignManager } from "../../core/managers/CampaignManager";

export class DevMenuController extends BaseMenuController {
    private session = SharedSession.getInstance();
    private audio = AudioManager.getInstance();
    private campaign = CampaignManager.getInstance();

    public onBack(): void {
    }

    public handleNav(id: StateId, params: any) {
        this.session.clearSavableKeys();
        this.session.set('campaign_id', null);
        this.session.set('campaign_step_index', 0);

        const target = StateRegistry.create(id, { reset: false, ...params });
        StateManager.getInstance().replace(target);
    }

    public openPopup(id: StateId, params: any = {}) {
        StateManager.getInstance().push(StateRegistry.create(id, params));
    }

    public startCampaign(id: string) {
        this.campaign.startCampaign(id);
    }

    public setVolume(cat: 'master' | 'ost' | 'sfx', val: number) {
        this.audio.setVolume(cat, val);
        this.session.set(`${cat}_volume`, val);
    }

    public updateResolution(r: string, setResProp?: (r: any) => void) {
        setResProp?.(r);
        this.session.set('resolution', r);
    }

    public getInitialVolumes() {
        return {
            master: this.session.get<number>('master_volume') ?? 0.5,
            ost: this.session.get<number>('ost_volume') ?? 0.5,
            sfx: this.session.get<number>('sfx_volume') ?? 0.5
        };
    }
}