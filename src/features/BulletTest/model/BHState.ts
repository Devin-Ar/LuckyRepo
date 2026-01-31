// src/features/Game1/model/Game1State.ts
import {BaseGameState} from '../../../core/templates/BaseGameState';
import {BHController} from '../view/BHController';
import {BHPresenter} from '../view/BHPresenter';
import {BHView} from '../view/BHView';
import {BHLogicSchema} from './BHLogicSchema';
import {BHViewSchema} from "./BHViewSchema";
import {BHConfig, BHLevel, getBHConfig} from './BHConfig';
import {SharedSession} from '../../../core/session/SharedSession';
import {GLOBAL_SESSION_MAP} from '../../../core/session/GlobalSessionMap';

export class BHState extends BaseGameState<BHPresenter, BHController, BHConfig> {
    public name = "BHTest";

    protected logicSchema = BHLogicSchema;
    protected viewSchema = BHViewSchema;
    protected viewComponent = BHView;

    constructor(forceReset: boolean = false, private currentLevel: BHLevel = BHLevel.Level1) {
        super(forceReset);
    }

    protected getConfig(): BHConfig {
        return getBHConfig(this.currentLevel);
    }

    protected getSessionOverrides(session: SharedSession): Partial<BHConfig> {
        const hp = session.get<number>(GLOBAL_SESSION_MAP.hp);
        return hp !== undefined ? {initialHP: hp} : {};
    }

    protected initMVC(): void {
        this.vm = new BHPresenter();
        this.controller = new BHController(this.vm);
    }
}