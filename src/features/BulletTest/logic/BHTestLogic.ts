// src/features/Game1/logic/Game1Logic.ts
import {BHLogicSchema} from '../model/BHLogicSchema';
import {BaseLogic} from '../../../core/templates/BaseLogic';
import {BaseDispatcher} from '../../../core/templates/BaseDispatcher';
import {BHCommands} from './BHCommands';
import {BHConfig} from '../model/BHConfig';
import {basePlayer} from '../interfaces/baseInterfaces/basePlayer';
import {baseEntity, RockEntity} from '../interfaces/baseInterfaces/baseEntity';
import {playerProjectile} from "../interfaces/baseInterfaces/baseProjectile";

export class BHTestLogic extends BaseLogic<BHConfig> {
    protected dispatcher: BaseDispatcher<BHTestLogic>;
    private player: basePlayer;
    private entities: baseEntity[] = [];
    private playerProjectiles: playerProjectile[] = [];
    private evilProjectils: baseEntity[] = [];
    private currentFrame: number = 0;

    constructor() {
        super(BHLogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, BHCommands, "BHTest");
        this.player = basePlayer.getInstance();
    }

    public applyConfig(config: BHConfig): void {
        this.config = config;
        this.player.applyConfig(config);

        if (this.entities.length === 0) {
            for (let i = 0; i < config.spawnCount; i++) this.spawnEntities();
        }
    }

    public override destroy(): void {
        super.destroy();
        this.entities = [];
        this.playerProjectiles = [];
        this.evilProjectils = [];
    }

    public override getSnapshot(): any {
        return {
            player: {...this.player},
            entities: [...this.entities],
            playerProjectiles: [...this.playerProjectiles],
            evilProjectils: [...this.evilProjectils],
            currentFrame: this.currentFrame,
            config: this.config
        };
    }

    public override loadSnapshot(data: any): void {
        if (!data) return;
        this.config = data.config;
        this.player = data.player;
        this.entities = data.entities;
        this.playerProjectiles = data.playerProjectiles;
        this.evilProjectils = data.evilProjectils;
        this.currentFrame = data.currentFrame ?? 0;
        this.isInitialized = true;
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config) return;
        this.currentFrame = frameCount;

        (this.player as basePlayer).updatePlayer(this.inputState, this.config, frameCount);

        for (const entity of this.entities) {
            entity.update(this.player, this.config);
        }

        if ((this.player as basePlayer).playerAction()) {
            this.playerProjectiles.push((this.player as basePlayer).fireProjectile(this.inputState, this.config));
        }

        for (const proj of this.playerProjectiles) {
            proj.update(this.player, this.config);
            proj.collided(this.entities);
        }

        this.playerProjectiles = this.playerProjectiles.filter(proj => proj.active);
        this.entities = this.entities.filter(proj => proj.active);

        this.syncToSAB(sharedView, frameCount, fps);
    }

    private spawnEntities(): void {
        if (!this.config || this.entities.length >= BHLogicSchema.MAX_ROCKS) return;
        this.entities.push(new RockEntity(
            Math.random() * this.config.width,
            .1 * this.config.height
        ));
    }

    private syncToSAB(sharedView: Float32Array, frameCount: number, fps: number): void {
        sharedView[BHLogicSchema.HERO_HP] = this.player.hp;
        sharedView[BHLogicSchema.HERO_X] = this.player.x;
        sharedView[BHLogicSchema.HERO_Y] = this.player.y;
        sharedView[BHLogicSchema.ENTITY_COUNT] = this.entities.length;

        this.entities.forEach((r, i) => {
            const base = BHLogicSchema.ROCKS_START_INDEX + (i * BHLogicSchema.ROCK_STRIDE);
            r.syncToSAB(sharedView, base);
        });

        sharedView[BHLogicSchema.PPROJ_START_INDEX - 1] = this.playerProjectiles.length;
        this.playerProjectiles.forEach((r, i) => {
            const base = BHLogicSchema.PPROJ_START_INDEX + (i * BHLogicSchema.PPROJ_STRIDE);
            r.syncToSAB(sharedView, base);
        });
    }
}