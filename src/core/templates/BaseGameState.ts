import React, {JSX} from 'react';
import {State} from './State';
import {WorkerManager} from '../managers/WorkerManager';
import {ViewWorkerManager} from '../managers/ViewWorkerManager';
import {SharedSession} from '../session/SharedSession';
import {AudioManager} from '../managers/AudioManager';
import {InputManager} from '../managers/InputManager';
import {SpriteManager} from '../managers/SpriteManager';
import {IBuffer, BufferMap} from '../interfaces/IBuffer';
import {GLOBAL_SESSION_MAP} from '../session/GlobalSessionMap';
import {IGameConfig} from '../interfaces/IGameConfig';

export abstract class BaseGameState<
    TVM extends { update: () => void } & Record<string, any>,
    TController extends { update: () => void, destroy: () => void },
    TConfig extends IGameConfig
> extends State {
    protected vm!: TVM;
    protected controller!: TController;
    protected instanceId: string = "";
    protected isLoadedFromSave: boolean = false;

    protected abstract logicSchema: IBuffer | BufferMap;
    protected abstract viewSchema: IBuffer | BufferMap;
    protected abstract viewComponent: React.ComponentType<any>;

    constructor(protected forceReset: boolean = false) {
        super();
        this.isRendering = false;
        this.isUpdating = false;
    }

    public async init(): Promise<void> {
        if (this.isInitialized) {
            this.isUpdating = true;
            this.isRendering = true;
            return;
        }

        const logicWorker = WorkerManager.getInstance();
        const viewWorker = ViewWorkerManager.getInstance();
        const session = SharedSession.getInstance();

        if ((logicWorker as any).activeStateName === this.name) {
            this.isLoadedFromSave = true;
        }

        this.instanceId = logicWorker.prepareForState(this.name);
        logicWorker.setupBuffers(this.logicSchema, this.forceReset);

        viewWorker.prepareForState(this.name);
        viewWorker.setupBuffers(logicWorker.getBuffers(), this.viewSchema);

        try {
            await this.internalLoadResources();
        } catch (e) {
            console.warn(`[${this.name}] Resource load warning:`, e);
        }

        this.initMVC();

        logicWorker.createState(this.name);
        viewWorker.createState(this.name);

        await this.internalPostInit(logicWorker, session);

        session.unlock();

        this.isInitialized = true;
        this.isUpdating = true;
        this.isRendering = true;
    }

    public update(dt: number, frameCount: number): void {
        if (this.isUpdating) {
            if (this.controller) this.controller.update();
            if (this.vm && (this.vm as any).update) (this.vm as any).update();
        }
    }

    public getView(): JSX.Element {
        return React.createElement(this.viewComponent, {
            key: this.instanceId,
            vm: this.vm,
            controller: this.controller
        });
    }

    public destroy(): void {
        const session = SharedSession.getInstance();
        const logicWorker = WorkerManager.getInstance();
        const viewWorker = ViewWorkerManager.getInstance();

        this.isUpdating = false;
        this.isRendering = false;
        this.isInitialized = false;

        this.syncGlobalsToSession(session);

        AudioManager.getInstance().stopAllByState(this.name);
        AudioManager.getInstance().uncacheByState(this.name);
        SpriteManager.getInstance().uncacheByState(this.name);

        if (this.controller) this.controller.destroy();

        this.onBeforeDestroy(session, logicWorker);

        logicWorker.terminateState(this.name, this.instanceId);
        viewWorker.terminateState(this.name);

        InputManager.getInstance().reset();
    }

    protected abstract getConfig(): TConfig;

    protected abstract getSessionOverrides(session: SharedSession): Partial<TConfig>;

    protected abstract initMVC(): void;

    protected async onCustomLoadResources(): Promise<void> {
    }

    protected onBeforeDestroy(session: SharedSession, worker: WorkerManager): void {
    }

    private async internalLoadResources(): Promise<void> {
        const config = this.getConfig();
        if (config.manifestPath) {
            await Promise.all([
                SpriteManager.getInstance().loadManifest(config.manifestPath, this.name),
                AudioManager.getInstance().loadManifest(config.manifestPath, this.name)
            ]);
        }
        await this.onCustomLoadResources();
    }

    private async internalPostInit(worker: WorkerManager, session: SharedSession): Promise<void> {
        const targetConfig = this.getConfig();

        if (this.isLoadedFromSave) {
            worker.isInitialized = true;
        } else if (this.forceReset) {
            session.clearSavableKeys();
            worker.sendInput(this.name, 'INITIALIZE', targetConfig);
        } else {
            const overrides = this.getSessionOverrides(session);
            const finalConfig = {...targetConfig, ...overrides};
            worker.sendInput(this.name, 'INITIALIZE', finalConfig);
        }

        if (this.vm && (this.vm as any).notify) {
            (this.vm as any).notify();
        }

        if (targetConfig.bgmKey) {
            AudioManager.getInstance().play(targetConfig.bgmKey);
        }
    }

    private syncGlobalsToSession(session: SharedSession): void {
        if (!this.vm) return;
        Object.entries(GLOBAL_SESSION_MAP).forEach(([vmKey, sessionKey]) => {
            if (vmKey in this.vm) {
                session.set(sessionKey, this.vm[vmKey]);
            }
        });
    }
}