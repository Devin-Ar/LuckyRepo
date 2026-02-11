// src/features/Game3/model/Game3State.ts
import { BaseGameState } from '../../../core/templates/BaseGameState';
import { Game3LogicSchema } from './Game3LogicSchema';
import { Game3ViewSchema } from './Game3ViewSchema';
import { Game3View } from '../view/Game3View';
import { Game3Presenter } from '../view/Game3Presenter';
import { Game3Controller } from '../view/Game3Controller';
import { Game3Config, Game3Level, getGame3Config } from './Game3Config';
import {StateId} from '../../../core/registry/StateId';

export class Game3State extends BaseGameState<Game3Presenter, Game3Controller, Game3Config> {
    public name = StateId.GAME_3;
    protected logicSchema = Game3LogicSchema;
    protected viewSchema = Game3ViewSchema;
    protected viewComponent = Game3View;

    constructor(forceReset: boolean = false, private currentLevel: Game3Level = Game3Level.Level1) {
        super(forceReset);
    }

    protected getConfig(): Game3Config {
        return getGame3Config(this.currentLevel);
    }

    protected getSessionOverrides(): Partial<Game3Config> {
        return {};
    }

    protected initMVC(): void {
        this.vm = new Game3Presenter();
        this.controller = new Game3Controller(this.vm);
    }

    public override async init(): Promise<void> {
        await super.init();

        // Orchestration: Config -> Controller -> Parse Map -> Send to Worker
        const config = this.getConfig();
        if (this.controller && config.mapPath) {
            await this.controller.initialize(config, this.currentLevel);
        }
    }
}