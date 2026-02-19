// src/features/shared-menus/controllers/SaveMenuController.ts
import { BaseMenuController } from "../../../core/templates/BaseMenuController";
import { SaveManager, SAVE_EXTENSION } from "../../../core/managers/SaveManager";
import { StateRegistry } from "../../../core/registry/StateRegistry";

export class SaveMenuController extends BaseMenuController {
    private saveManager = SaveManager.getInstance();

    public onBack(): void {
        this.stateManager.pop();
    }

    public getActiveGameName(): string {
        return this.stateManager.getUnderlyingStateName() || "Unknown";
    }

    public async handleSave(slotName: string): Promise<void> {
        const targetName = this.getActiveGameName();
        if (targetName) {
            await this.saveManager.performSave(slotName, targetName);
        }
    }

    public async handleLoad(slotName: string): Promise<void> {
        try {
            const saveData = await this.saveManager.performLoad(slotName);
            const targetState = await StateRegistry.create(saveData.stateName, { reset: false });

            this.stateManager.pop();
            this.stateManager.replace(targetState);
        } catch (e) {
            console.error("Failed to load save:", e);
        }
    }

    public async handleDelete(slotName: string): Promise<void> {
        await this.saveManager.deleteSave(slotName);
    }

    public async handleExport(slotName: string): Promise<void> {
        const json = await this.saveManager.exportSave(slotName);
        const blob = new Blob([json], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${slotName}${SAVE_EXTENSION}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    public async handleImport(file: File): Promise<void> {
        const text = await file.text();
        await this.saveManager.importSave(text);
    }
}