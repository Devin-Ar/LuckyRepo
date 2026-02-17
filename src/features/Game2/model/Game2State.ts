// src/features/Game2/model/Game2State.ts
import {BaseGameState} from '../../../core/templates/BaseGameState';
import {Game2LogicSchema} from './Game2LogicSchema';
import {Game2ViewSchema} from './Game2ViewSchema';
import {Game2View} from '../view/Game2View';
import {Game2Presenter} from '../view/Game2Presenter';
import {Game2Controller} from '../view/Game2Controller';
import {Game2Config, Game2Level, getGame2Config} from './Game2Config';
import {SharedSession} from '../../../core/session/SharedSession';
import {GLOBAL_SESSION_MAP} from '../../../core/session/GlobalSessionMap';
import {FeatureEnum} from '../../FeatureEnum';

export class Game2State extends BaseGameState<Game2Presenter, Game2Controller, Game2Config> {
    public name = FeatureEnum.GAME_2;
    protected logicSchema = Game2LogicSchema;
    protected viewSchema = Game2ViewSchema;
    protected viewComponent = Game2View;

    constructor(forceReset: boolean = false, private currentLevel: Game2Level = Game2Level.Level1) {
        super(forceReset);
    }

    protected getConfig(): Game2Config {
        return getGame2Config(this.currentLevel);
    }

    protected getSessionOverrides(session: SharedSession): Partial<Game2Config> {
        const overrides: Partial<Game2Config> = {};

        const hp = session.get<number>(GLOBAL_SESSION_MAP.hp);
        if (hp !== undefined) overrides.initialHP = hp;

        const energy = session.get<number>(GLOBAL_SESSION_MAP.energy);
        if (energy !== undefined) overrides.initialEnergy = energy;

        return overrides;
    }

    protected initMVC(): void {
        this.vm = new Game2Presenter();
        this.controller = new Game2Controller(this.vm);
    }
}