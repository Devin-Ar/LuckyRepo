// src/features/Cinematic/CinematicController.ts
import { CampaignManager } from "../../core/managers/CampaignManager";
import { InputManager } from "../../core/managers/InputManager";
import { BaseMenuController } from "../../core/templates/BaseMenuController";

export class CinematicController extends BaseMenuController {
    private onUpdate?: (alpha: number) => void;
    private hasCompleted: boolean = false;

    public bind(callback: (alpha: number) => void) {
        this.onUpdate = callback;
    }

    protected onKeyDown(e: KeyboardEvent) {
        const input = InputManager.getInstance();
        if (input.isKeyAction(e.key, "UI_ACCEPT")) {
            this.exit();
        }
    }

    public async startSequence(fadeInMs: number, stayMs: number, fadeOutMs: number) {
        try {
            await this.animateAlpha(0, 1, fadeInMs);
            await this.wait(stayMs);
            await this.animateAlpha(1, 0, fadeOutMs);
            this.exit();
        } catch (e) {
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, ms);
            const check = () => {
                if (this.hasCompleted) {
                    clearTimeout(timer);
                    reject();
                } else {
                    requestAnimationFrame(check);
                }
            };
            requestAnimationFrame(check);
        });
    }

    private animateAlpha(start: number, end: number, duration: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const tick = (now: number) => {
                if (this.hasCompleted) {
                    reject();
                    return;
                }
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const alpha = start + (end - start) * progress;
                this.onUpdate?.(alpha);

                if (progress < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    private exit() {
        if (this.hasCompleted) return;
        this.hasCompleted = true;
        this.onUpdate?.(0);
        CampaignManager.getInstance().completeCurrentStep();
    }

    public onBack(): void {
        this.exit();
    }
}