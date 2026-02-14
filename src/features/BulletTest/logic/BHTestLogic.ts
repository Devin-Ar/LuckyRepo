// src/features/BulletTest/logic/BHTestLogic.ts
import { BHLogicSchema } from '../model/BHLogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { BHCommands } from './BHCommands';
import { BHConfig } from '../model/BHConfig';
import { basePlayer } from '../interfaces/baseInterfaces/basePlayer';
import { baseEntity } from '../interfaces/baseInterfaces/baseEntity';
import { playerProjectile } from '../interfaces/baseInterfaces/baseProjectile';
import { WaveManager } from './WaveManager';
import { IWaveDefinition } from '../interfaces/IRoom';
import waveData from '../data/bh_waves.json';

interface WaveLevelData {
    waves: IWaveDefinition[];
}

export class BHTestLogic extends BaseLogic<BHConfig> {
    protected dispatcher: BaseDispatcher<BHTestLogic>;
    private player: basePlayer;
    private entities: baseEntity[] = [];
    private playerProjectiles: playerProjectile[] = [];
    private enemyProjectiles: baseEntity[] = [];
    private currentFrame: number = 0;

    // Wave system
    private waveManager: WaveManager = new WaveManager();
    private wavesStarted: boolean = false;

    // Exit door
    private exitDoorActive: boolean = false;
    private exitDoorX: number = 0;
    private exitDoorY: number = 0;
    private static readonly DOOR_SIZE = 60;
    private exitDoorEntered: boolean = false;

    constructor() {
        super(BHLogicSchema.REVISION);
        this.dispatcher = new BaseDispatcher(this, BHCommands, "BHTest");
        this.player = basePlayer.getInstance();
    }

    public applyConfig(config: BHConfig): void {
        this.config = config;
        this.player.applyConfig(config);

        // Load wave definitions from the JSON based on level
        const levelKey = config.levelLabel || "Level 1";
        const levelWaves = (waveData as Record<string, WaveLevelData>)[levelKey];

        if (levelWaves && levelWaves.waves) {
            this.waveManager.loadWaves(levelWaves.waves);
        } else {
            console.warn(`[BHTestLogic] No wave data for "${levelKey}", using empty waves`);
            this.waveManager.loadWaves([]);
        }

        // Reset entities for fresh start
        this.entities = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.wavesStarted = false;
        this.exitDoorActive = false;
        this.exitDoorEntered = false;
        this.exitDoorX = config.width / 2;
        this.exitDoorY = config.height / 2;
    }

    public override destroy(): void {
        super.destroy();
        this.entities = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.wavesStarted = false;
    }

    public override getSnapshot(): any {
        return {
            player: { ...this.player },
            entities: [...this.entities],
            playerProjectiles: [...this.playerProjectiles],
            enemyProjectiles: [...this.enemyProjectiles],
            currentFrame: this.currentFrame,
            config: this.config,
            waveSnapshot: this.waveManager.getSnapshot(),
            wavesStarted: this.wavesStarted
        };
    }

    public override loadSnapshot(data: any): void {
        if (!data) return;
        this.config = data.config;
        this.player = data.player;
        this.entities = data.entities;
        this.playerProjectiles = data.playerProjectiles;
        this.enemyProjectiles = data.enemyProjectiles;
        this.currentFrame = data.currentFrame ?? 0;
        this.wavesStarted = data.wavesStarted ?? false;
        if (data.waveSnapshot) {
            this.waveManager.loadSnapshot(data.waveSnapshot);
        }
        this.isInitialized = true;
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config) return;
        this.currentFrame = frameCount;

        // Start waves on first update if not already started
        if (!this.wavesStarted) {
            this.waveManager.start();
            this.wavesStarted = true;
        }

        // Update wave manager - it checks if current wave is cleared and returns spawns for next wave
        const activeEnemyCount = this.entities.filter(e => e.active).length;
        const newSpawns = this.waveManager.update(activeEnemyCount);

        if (newSpawns) {
            const newEntities = WaveManager.spawnFromDefinitions(newSpawns, this.config);
            this.entities.push(...newEntities);
        }

        // Update player
        (this.player as basePlayer).updatePlayer(this.inputState, this.config, frameCount);

        // Update existing entities
        for (const entity of this.entities) {
            entity.update(this.player, this.config);
        }

        // Handle player shooting
        if ((this.player as basePlayer).playerAction()) {
            this.playerProjectiles.push(
                (this.player as basePlayer).fireProjectile(this.inputState, this.config)
            );
        }

        // Update projectiles and check collisions
        for (const proj of this.playerProjectiles) {
            proj.update(this.player, this.config);
            proj.collided(this.entities);
        }

        // Clean up dead entities and expired projectiles
        this.playerProjectiles = this.playerProjectiles.filter(proj => proj.active);
        this.entities = this.entities.filter(entity => entity.active);

        // Check player death
        if (this.player.hp <= 0) {
            self.postMessage({ type: 'EVENT', name: 'PLAYER_DEAD' });
        }

        // Emit room cleared event when all waves done
        if (this.waveManager.isAllCleared() && this.entities.length === 0) {
            self.postMessage({ type: 'EVENT', name: 'ROOM_CLEARED' });

            // Activate the exit door
            if (!this.exitDoorActive) {
                this.exitDoorActive = true;
            }
        }

        // Check if player steps on the exit door
        if (this.exitDoorActive && !this.exitDoorEntered) {
            const halfDoor = BHTestLogic.DOOR_SIZE / 2;
            const px = this.player.x;
            const py = this.player.y;
            if (
                px >= this.exitDoorX - halfDoor && px <= this.exitDoorX + halfDoor &&
                py >= this.exitDoorY - halfDoor && py <= this.exitDoorY + halfDoor
            ) {
                this.exitDoorEntered = true;
                self.postMessage({ type: 'EVENT', name: 'EXIT_DOOR_ENTERED' });
            }
        }

        this.syncToSAB(sharedView, frameCount, fps);
    }

    private syncToSAB(sharedView: Float32Array, frameCount: number, fps: number): void {
        sharedView[BHLogicSchema.HERO_HP] = this.player.hp;
        sharedView[BHLogicSchema.HERO_X] = this.player.x;
        sharedView[BHLogicSchema.HERO_Y] = this.player.y;
        sharedView[BHLogicSchema.ENTITY_COUNT] = this.entities.length;

        // Wave state info
        sharedView[BHLogicSchema.CURRENT_WAVE] = this.waveManager.getCurrentWave();
        sharedView[BHLogicSchema.TOTAL_WAVES] = this.waveManager.getTotalWaves();
        sharedView[BHLogicSchema.WAVE_DELAY_TIMER] = this.waveManager.getDelayTimer();

        // Encode wave state as a number: IDLE=0, DELAY=1, ACTIVE=2, CLEARED=3, ALL_CLEARED=4
        const stateMap: Record<string, number> = {
            'IDLE': 0, 'DELAY': 1, 'ACTIVE': 2, 'CLEARED': 3, 'ALL_CLEARED': 4
        };
        sharedView[BHLogicSchema.WAVE_STATE] = stateMap[this.waveManager.getState()] ?? 0;

        // Exit door
        sharedView[BHLogicSchema.EXIT_DOOR_ACTIVE] = this.exitDoorActive ? 1 : 0;
        sharedView[BHLogicSchema.EXIT_DOOR_X] = this.exitDoorX;
        sharedView[BHLogicSchema.EXIT_DOOR_Y] = this.exitDoorY;

        // Encode current level: "Level 1"=0, "Level 2"=1, "Level 3"=2
        const levelLabel = this.config!.levelLabel || "Level 1";
        const levelIndex = levelLabel === "Level 3" ? 2 : levelLabel === "Level 2" ? 1 : 0;
        sharedView[BHLogicSchema.CURRENT_LEVEL] = levelIndex;

        // Entities
        this.entities.forEach((r, i) => {
            const base = BHLogicSchema.ROCKS_START_INDEX + (i * BHLogicSchema.ROCK_STRIDE);
            r.syncToSAB(sharedView, base);
        });

        // Player projectiles
        sharedView[BHLogicSchema.PPROJ_START_INDEX - 1] = this.playerProjectiles.length;
        this.playerProjectiles.forEach((r, i) => {
            const base = BHLogicSchema.PPROJ_START_INDEX + (i * BHLogicSchema.PPROJ_STRIDE);
            r.syncToSAB(sharedView, base);
        });
    }
}