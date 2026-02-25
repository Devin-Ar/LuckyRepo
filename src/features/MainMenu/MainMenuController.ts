// src/features/MainMenu/MainMenuController.ts
import { BaseMenuController } from "../../core/templates/BaseMenuController";
import { StateManager } from "../../core/managers/StateManager";
import { StateRegistry } from "../../core/registry/StateRegistry";
import { FeatureEnum } from "../FeatureEnum";
import { CampaignManager } from "../../core/managers/CampaignManager";
import { InputManager } from "../../core/managers/InputManager";
import { AudioManager } from "../../core/managers/AudioManager";

export class MainMenuController extends BaseMenuController {
    private campaign = CampaignManager.getInstance();
    private audio = AudioManager.getInstance();

    private selectedIndex: number = 0;
    private readonly MENU_COUNT: number = 4;
    private onViewUpdate?: (index: number) => void;

    private resOverride: any;
    private setResOverride: any;

    public bindView(callback: (index: number) => void, res: any, setRes: any) {
        this.onViewUpdate = callback;
        this.resOverride = res;
        this.setResOverride = setRes;
        this.onViewUpdate(this.selectedIndex);
    }

    public unbindView() { this.onViewUpdate = undefined; }

    public playBGM() {
        this.audio.play('bgm_menu');
    }

    public stopBGM() {
        this.audio.stop('bgm_menu');
    }

    private playNavSFX() {
        this.audio.play('sfx_nav');
    }

    public setHoverIndex(index: number) {
        if (this.selectedIndex !== index) {
            this.selectedIndex = index;
            this.playNavSFX();
            this.onViewUpdate?.(this.selectedIndex);
        }
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const input = InputManager.getInstance();
        let changed = false;

        if (input.isKeyAction(e.key, "UI_DOWN")) {
            this.selectedIndex = (this.selectedIndex + 1) % this.MENU_COUNT;
            changed = true;
        } else if (input.isKeyAction(e.key, "UI_UP")) {
            this.selectedIndex = (this.selectedIndex - 1 + this.MENU_COUNT) % this.MENU_COUNT;
            changed = true;
        } else if (input.isKeyAction(e.key, "UI_ACCEPT")) {
            this.executeSelected();
        }

        if (changed) {
            this.playNavSFX();
            this.onViewUpdate?.(this.selectedIndex);
        }
    }

    public executeSelected() {
        switch(this.selectedIndex) {
            case 0: this.campaign.startCampaign('cross_game'); break;
            case 1: this.openPopup(FeatureEnum.SAVE_MENU); break;
            case 2: this.openPopup(FeatureEnum.SETTINGS_MENU, { res: this.resOverride, setRes: this.setResOverride }); break;
            case 3: this.handleNav(FeatureEnum.DEV_MENU); break;
        }
    }

    public async handleNav(id: FeatureEnum, params: any = {}) {
        const target = await StateRegistry.create(id, { reset: false, ...params });
        StateManager.getInstance().replace(target);
    }

    public async openPopup(id: FeatureEnum, params: any = {}) {
        const target = await StateRegistry.create(id, params);
        StateManager.getInstance().push(target);
    }

    public onBack(): void {
    }
}