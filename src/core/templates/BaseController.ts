// src/core/templates/BaseController.ts
import {IController} from "../interfaces/IController";
import {WorkerManager} from "../managers/WorkerManager";
import {SaveManager} from "../managers/SaveManager";

export abstract class BaseController<TVM extends { update: () => void }> implements IController {
    protected workers: WorkerManager;
    protected readonly QUICK_SAVE_KEY = 'quick_save';

    constructor(protected vm: TVM, protected stateName: string) {
        this.workers = WorkerManager.getInstance();

        window.addEventListener('keydown', this.handleKeyDown);
        this.workers.logic.addEventListener('message', this.handleWorkerMessage);

        this.captureInitialState();
    }

    public update(): void {
        this.vm.update();
    }

    public destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.workers.logic.removeEventListener('message', this.handleWorkerMessage);
        this.onInternalDestroy();
    }

    protected abstract onKeyDown(e: KeyboardEvent): void;

    protected abstract onWorkerEvent(name: string, payload: any): void;

    protected send(action: string, payload: any = {}): void {
        this.workers.sendInput(this.stateName, action, payload);
    }

    protected onInternalDestroy(): void {
    }

    private captureInitialState() {
        setTimeout(async () => {
            await SaveManager.getInstance().performSave(this.QUICK_SAVE_KEY, this.stateName);
        }, 200);
    }

    private handleWorkerMessage = (e: MessageEvent) => {
        const {type, name, payload} = e.data;
        if (type === 'EVENT') {
            this.onWorkerEvent(name, payload);
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        // We pass the event to the subclass to handle specifically
        this.onKeyDown(e);
    };
}