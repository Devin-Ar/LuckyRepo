// src/features/shared-menus/controllers/PauseMenuController.ts
import { BaseMenuController } from "../../../core/templates/BaseMenuController";
import { StateRegistry } from "../../../core/registry/StateRegistry";
import { StateId } from "../../../core/registry/StateId";

export class PauseMenuController extends BaseMenuController {
    public onBack(): void {
        this.stateManager.pop();
    }

    public onSave(): void {
        this.stateManager.push(StateRegistry.create(StateId.SAVE_MENU));
    }

    public onSettings(): void {
        this.stateManager.push(StateRegistry.create(StateId.SETTINGS_MENU));
    }

    public onQuit(): void {
        this.stateManager.pop();
        this.stateManager.replace(StateRegistry.create(StateId.DEV_MENU));
    }
}