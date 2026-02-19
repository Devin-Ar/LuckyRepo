// src/features/shared-menus/controllers/PauseMenuController.ts
import { BaseMenuController } from "../../../core/templates/BaseMenuController";
import { StateRegistry } from "../../../core/registry/StateRegistry";
import { FeatureEnum } from "../../FeatureEnum";

export class PauseMenuController extends BaseMenuController {
    public onBack(): void {
        this.stateManager.pop();
    }

    public async onSave(): Promise<void> {
        const target = await StateRegistry.create(FeatureEnum.SAVE_MENU);
        this.stateManager.push(target);
    }

    public async onSettings(): Promise<void> {
        const target = await StateRegistry.create(FeatureEnum.SETTINGS_MENU);
        this.stateManager.push(target);
    }

    public async onQuit(): Promise<void> {
        this.stateManager.pop();
        const target = await StateRegistry.create(FeatureEnum.DEV_MENU);
        this.stateManager.replace(target);
    }
}