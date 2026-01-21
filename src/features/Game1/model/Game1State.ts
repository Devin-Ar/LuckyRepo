// src/features/Game1/model/Game1State.ts
import {BaseGameState} from '../../../core/templates/BaseGameState';
import {Game1Controller} from '../view/Game1Controller';
import {Game1Presenter} from '../view/Game1Presenter';
import {Game1View} from '../view/Game1View';
import {Game1LogicSchema} from './Game1LogicSchema';
import {Game1ViewSchema} from "./Game1ViewSchema";
import {Game1Config, Game1Level, getGame1Config} from './Game1Config';
import {SharedSession} from '../../../core/session/SharedSession';
import {GLOBAL_SESSION_MAP} from '../../../core/session/GlobalSessionMap';

export class Game1State extends BaseGameState<Game1Presenter, Game1Controller, Game1Config> {
    public name = "Game1";

    protected logicSchema = Game1LogicSchema;
    protected viewSchema = Game1ViewSchema;
    protected viewComponent = Game1View;

    constructor(forceReset: boolean = false, private currentLevel: Game1Level = Game1Level.Level1) {
        super(forceReset);
    }

    protected getConfig(): Game1Config {
        return getGame1Config(this.currentLevel);
    }

    protected getSessionOverrides(session: SharedSession): Partial<Game1Config> {
        const hp = session.get<number>(GLOBAL_SESSION_MAP.hp);
        return hp !== undefined ? {initialHP: hp} : {};
    }

    protected initMVC(): void {
        this.vm = new Game1Presenter();
        this.controller = new Game1Controller(this.vm);
    }
}