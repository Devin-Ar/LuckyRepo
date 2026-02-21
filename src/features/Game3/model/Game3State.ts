// src/features/Game3/model/Game3State.ts
import { BaseGameState } from '../../../core/templates/BaseGameState';
import { Game3LogicSchema } from './Game3LogicSchema';
import { Game3ViewSchema } from './Game3ViewSchema';
import { Game3View } from '../view/Game3View';
import { Game3Presenter } from '../view/Game3Presenter';
import { Game3Controller } from '../view/Game3Controller';
import { Game3Config, Game3Level, getGame3Config } from './Game3Config';
import {FeatureEnum} from "../../FeatureEnum";
import {SharedSession} from "../../../core/session/SharedSession";
import {GLOBAL_SESSION_MAP} from "../../../core/session/GlobalSessionMap";
import {InputManager} from "../../../core/managers/InputManager";

export interface Game3Params {
    reset?: boolean;
    level?: Game3Level;
}

export class Game3State extends BaseGameState<Game3Presenter, Game3Controller, Game3Config> {
    public name = FeatureEnum.GAME_3;
    protected logicSchema = Game3LogicSchema;
    protected viewSchema = Game3ViewSchema;
    protected viewComponent = Game3View;

    private currentLevel: Game3Level;

    constructor(params: Game3Params = {}) {
        super(params.reset ?? false);
        this.currentLevel = params.level ?? Game3Level.Level1;
    }

    protected getConfig(): Game3Config {
        return getGame3Config(this.currentLevel);
    }

    protected getSessionOverrides(session: SharedSession): Partial<Game3Config> {
        const hp = session.get<number>(GLOBAL_SESSION_MAP.hp);
        return hp !== undefined ? {initialHP: hp} : {};
    }

    protected initMVC(): void {
        this.vm = new Game3Presenter();
        this.controller = new Game3Controller(this.vm);
    }

    public override async init(): Promise<void> {
        InputManager.getInstance().refreshBindings(this.name);
        await super.init();

        const session = SharedSession.getInstance();
        const baseConfig = this.getConfig();
        const overrides = this.getSessionOverrides(session);
        const finalConfig = { ...baseConfig, ...overrides };

        if (this.controller && finalConfig.mapPath) {
            await this.controller.initialize(finalConfig, this.currentLevel);
        }
    }
}