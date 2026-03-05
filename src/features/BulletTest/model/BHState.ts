// src/features/BulletTest/model/BHState.ts
import {BaseGameState} from '../../../core/templates/BaseGameState';
import {BHController} from '../view/BHController';
import {BHPresenter} from '../view/BHPresenter';
import {BHView} from '../view/BHView';
import {BHLogicSchema} from './BHLogicSchema';
import {BHViewSchema} from "./BHViewSchema";
import {BHConfig, BHLevel, getBHConfig} from './BHConfig';
import {SharedSession} from '../../../core/session/SharedSession';
import {GLOBAL_SESSION_MAP} from '../../../core/session/GlobalSessionMap';
import {InputManager} from "../../../core/managers/InputManager";
import {FeatureEnum} from "../../FeatureEnum";

export interface BHParams {
    reset?: boolean;
    level?: BHLevel;
}

export class BHState extends BaseGameState<BHPresenter, BHController, BHConfig> {
    public name = FeatureEnum.BH_GAME;

    protected logicSchema = BHLogicSchema;
    protected viewSchema = BHViewSchema;
    protected viewComponent = BHView;

    private currentLevel: BHLevel;

    constructor(params: BHParams = {}) {
        super(params.reset ?? false);
        this.currentLevel = params.level ?? BHLevel.Level1;
    }

    protected getConfig(): BHConfig {
        return getBHConfig(this.currentLevel);
    }

    protected getSessionOverrides(session: SharedSession): Partial<BHConfig> {
        const overrides: Partial<BHConfig> & { initialPoints?: number; initialCoins?: number; initialHeldItem?: number } = {};

        const hp = session.get<number>(GLOBAL_SESSION_MAP.hp);
        if (hp !== undefined) overrides.initialHP = hp;

        const pts = session.get<number>(GLOBAL_SESSION_MAP.points);
        if (pts !== undefined) (overrides as any).initialPoints = pts;

        const cns = session.get<number>(GLOBAL_SESSION_MAP.coins);
        if (cns !== undefined) (overrides as any).initialCoins = cns;

        const item = session.get<number>(GLOBAL_SESSION_MAP.heldItem);
        if (item !== undefined) (overrides as any).initialHeldItem = item;

        return overrides;
    }

    protected initMVC(): void {
        this.vm = new BHPresenter();
        this.controller = new BHController(this.vm);
    }

    public async init(): Promise<void> {
        InputManager.getInstance().refreshBindings(this.name);

        await super.init();
    }
}