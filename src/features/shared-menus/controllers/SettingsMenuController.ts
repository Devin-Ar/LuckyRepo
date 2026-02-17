// src/features/shared-menus/controllers/SettingsMenuController.ts
import { BaseMenuController } from "../../../core/templates/BaseMenuController";
import { SharedSession } from "../../../core/session/SharedSession";
import { AudioManager } from "../../../core/managers/AudioManager";
import { StateManager } from "../../../core/managers/StateManager"; // Import explicitly
import { INPUT_REGISTRY } from "../../../core/registry/InputRegistry";

export class SettingsMenuController extends BaseMenuController {
    private session = SharedSession.getInstance();
    private audio = AudioManager.getInstance();

    private onRefreshBinds?: () => void;

    public registerBindRefresh(cb: () => void) {
        this.onRefreshBinds = cb;
    }

    public onBack(): void {
        StateManager.getInstance().pop();
    }

    public getVolume(type: 'master' | 'ost' | 'sfx'): number {
        return this.session.get<number>(`${type}_volume`) ?? 0.5;
    }

    public setVolume(type: 'master' | 'ost' | 'sfx', value: number) {
        this.session.set(`${type}_volume`, value);
        this.audio.setVolume(type, value);
    }

    public getResolution(): string {
        return this.session.get<string>('resolution') ?? '1080p';
    }

    public setResolution(res: string) {
        this.session.set('resolution', res);
    }

    public async toggleFullscreen(): Promise<boolean> {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
            return true;
        } else {
            if (document.exitFullscreen) await document.exitFullscreen();
            return false;
        }
    }

    public getRegistryProfiles(): string[] {
        return Object.keys(INPUT_REGISTRY);
    }

    public getBindingsForGame(gameName: string): Record<string, { keys: string[], label: string }> {
        const rawRegistry = INPUT_REGISTRY[gameName] || {};
        const overrides = this.session.get<Record<string, string[]>>(`bind_${gameName}`) || {};

        const result: Record<string, { keys: string[], label: string }> = {};

        for (const [action, data] of Object.entries(rawRegistry)) {
            result[action] = {
                label: data.label,
                keys: overrides[action] ? [...overrides[action]] : [...data.keys]
            };
        }

        return result;
    }

    public setBinding(action: string, key: string, gameName: string, slotIndex: number) {
        this.input.setBinding(action, key, gameName, slotIndex);

        if (this.onRefreshBinds) this.onRefreshBinds();
    }

    public resetBindings(gameName: string) {
        this.input.resetBindings(gameName);
        if (this.onRefreshBinds) this.onRefreshBinds();
    }
}