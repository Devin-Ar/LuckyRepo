// src/features/BulletTest/logic/BHTestLogic.ts
import { BHMainLogicSchema, BHRocksLogicSchema, BHPProjLogicSchema, BHEProjLogicSchema } from '../model/BHLogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { BHCommands } from './BHCommands';
import { BHConfig } from '../model/BHConfig';
import { basePlayer } from '../interfaces/baseInterfaces/basePlayer';
import {baseEntity, BossEntity, ShotEntity} from '../interfaces/baseInterfaces/baseEntity';
import {enemyProjectile, playerProjectile} from '../interfaces/baseInterfaces/baseProjectile';
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
    private enemyProjectiles: enemyProjectile[] = [];
    private currentFrame: number = 0;

    // Boss system
    private boss: BossEntity | null = null;
    private bossLevel: boolean = false;
    private bossTargetHp: number = 3;

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
        super(BHMainLogicSchema.REVISION);
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

        const levelLabel = this.config!.levelLabel || "Level 1";
        this.bossLevel = levelLabel === "Level 4";
        if (this.bossLevel) {
            this.boss = new BossEntity(config.width / 2 - 100, 50);
            this.bossTargetHp = 200; // Vulnerable after wave 1 until hits 200, then wave 2...
        } else {
            this.boss = null;
        }
    }

    public override destroy(): void {
        super.destroy();
        this.entities = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.wavesStarted = false;
        this.boss = null;
        this.bossLevel = false;
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

        // Transition waves automatically for non-boss levels
        if (!this.bossLevel && this.waveManager.getState() === 'CLEARED') {
            this.waveManager.nextWave();
        }

    // Boss logic
        if (this.bossLevel && this.boss) {
            const waveState = this.waveManager.getState();
            
            // Boss is vulnerable only if no enemies are present and it's between waves or all waves cleared
            if (activeEnemyCount > 0 || waveState === 'ACTIVE' || waveState === 'DELAY') {
                 this.boss.vulnerable = false;
            } else if (waveState === 'CLEARED' || waveState === 'ALL_CLEARED') {
                 // Boss becomes vulnerable when current wave is cleared, until it reaches next HP threshold
                 if (this.boss.health > this.bossTargetHp) {
                     this.boss.vulnerable = true;
                 } else if (this.boss.vulnerable) {
                     this.boss.vulnerable = false;
                     this.bossTargetHp -= 100;
                     // If boss reached target HP, advance to next wave if possible
                     if (waveState === 'CLEARED') {
                         this.waveManager.nextWave();
                     }
                 }
            }

            // If boss is vulnerable, it shoots
            this.boss.updateAttacks(this.player, frameCount, this.enemyProjectiles);
        }

        if (newSpawns) {
            const newEntities = WaveManager.spawnFromDefinitions(newSpawns, this.config);
            this.entities.push(...newEntities);
        }

        // Update player
        (this.player as basePlayer).updatePlayer(this.inputState, this.config, frameCount);

        // Update existing entities
        for (const entity of this.entities) {
            if (entity.type === "singleShot") {
                const typeCast : ShotEntity = entity as unknown as ShotEntity;
                typeCast.updateProjectile(this.player, this.config, this.enemyProjectiles);
            }
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
            if (this.boss) {
                proj.collided([this.boss]);
            }
        }

        // Update projectiles and check collisions
        for (const proj of this.enemyProjectiles) {
            proj.update(this.player, this.config);
            proj.collided(this.player);
        }

        // Clean up dead entities and expired projectiles
        this.playerProjectiles = this.playerProjectiles.filter(proj => proj.active);
        this.enemyProjectiles = this.enemyProjectiles.filter(proj => proj.active);
        this.entities = this.entities.filter(entity => entity.active);

        // Check player death
        if (this.player.hp <= 0) {
            self.postMessage({ type: 'EVENT', name: 'PLAYER_DEAD' });
        }

        // Emit room cleared event when all waves done
        const bossCleared = this.bossLevel ? (this.boss && !this.boss.active) : true;
        if (this.waveManager.isAllCleared() && this.entities.length === 0 && bossCleared) {
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

    private syncToSAB(sMain: Float32Array, frameCount: number, fps: number): void {
        const sRocks = this.sharedViews.get('rocks');
        const sPProjs = this.sharedViews.get('pProjs');
        const sEProjs = this.sharedViews.get('eProjs');

        if (!sMain || !sRocks || !sPProjs || !sEProjs) return;

        const M = BHMainLogicSchema;

        sMain[M.HERO_HP] = this.player.hp;
        sMain[M.HERO_X] = this.player.x;
        sMain[M.HERO_Y] = this.player.y;
        sMain[M.HERO_WIDTH] = this.player.width;
        sMain[M.HERO_HEIGHT] = this.player.height;
        sMain[M.FRAME_COUNT] = frameCount;
        if (this.config) {
            const dx = -this.config.width*this.inputState.mouseX + this.player.x;
            const dy = -this.config.height*this.inputState.mouseY + this.player.y;
            sMain[M.MOUSE_RELATIVE] = Math.atan2(dy, dx);
            sMain[M.MAP_WIDTH] = this.config.width;
            sMain[M.MAP_HEIGHT] = this.config.height;
        }
        sMain[M.FPS] = fps;

        // Wave state info
        sMain[M.CURRENT_WAVE] = this.waveManager.getCurrentWave();
        sMain[M.TOTAL_WAVES] = this.waveManager.getTotalWaves();
        sMain[M.WAVE_DELAY_TIMER] = this.waveManager.getDelayTimer();

        // Encode wave state as a number: IDLE=0, DELAY=1, ACTIVE=2, CLEARED=3, ALL_CLEARED=4
        const stateMap: Record<string, number> = {
            'IDLE': 0, 'DELAY': 1, 'ACTIVE': 2, 'CLEARED': 3, 'ALL_CLEARED': 4
        };
        sMain[M.WAVE_STATE] = stateMap[this.waveManager.getState()] ?? 0;

        // Exit door
        sMain[M.EXIT_DOOR_ACTIVE] = this.exitDoorActive ? 1 : 0;
        sMain[M.EXIT_DOOR_X] = this.exitDoorX;
        sMain[M.EXIT_DOOR_Y] = this.exitDoorY;

        // Encode current level: "Level 1"=0, "Level 2"=1, "Level 3"=2, "Level 4"=3
        const levelLabel = this.config!.levelLabel || "Level 1";
        const levelIndex = levelLabel === "Level 4" ? 3 : levelLabel === "Level 3" ? 2 : levelLabel === "Level 2" ? 1 : 0;
        sMain[M.CURRENT_LEVEL] = levelIndex;

        if (this.boss) {
            sMain[M.BOSS_HP] = this.boss.health;
            sMain[M.BOSS_VULNERABLE] = this.boss.vulnerable ? 1 : 0;
            sMain[M.BOSS_X] = this.boss.x;
            sMain[M.BOSS_Y] = this.boss.y;
            sMain[M.BOSS_ACTIVE] = this.boss.active ? 1 : 0;
        } else {
            sMain[M.BOSS_HP] = 0;
            sMain[M.BOSS_VULNERABLE] = 0;
            sMain[M.BOSS_ACTIVE] = 0;
        }

        // Entities (Rocks)
        const rockCapacity = Math.floor(sRocks.length / BHRocksLogicSchema.STRIDE);
        const rockCount = Math.min(this.entities.length, rockCapacity);
        sMain[M.ROCK_COUNT] = rockCount;
        for (let i = 0; i < rockCount; i++) {
            const base = i * BHRocksLogicSchema.STRIDE;
            this.entities[i].syncToSAB(sRocks, base);
        }

        // Player projectiles
        const pProjCapacity = Math.floor(sPProjs.length / BHPProjLogicSchema.STRIDE);
        const pProjCount = Math.min(this.playerProjectiles.length, pProjCapacity);
        sMain[M.PPROJ_COUNT] = pProjCount;
        for (let i = 0; i < pProjCount; i++) {
            const base = i * BHPProjLogicSchema.STRIDE;
            this.playerProjectiles[i].syncToSAB(sPProjs, base);
        }

        // Enemy projectiles
        const eProjCapacity = Math.floor(sEProjs.length / BHEProjLogicSchema.STRIDE);
        const eProjCount = Math.min(this.enemyProjectiles.length, eProjCapacity);
        sMain[M.EPROJ_COUNT] = eProjCount;
        for (let i = 0; i < eProjCount; i++) {
            const base = i * BHEProjLogicSchema.STRIDE;
            this.enemyProjectiles[i].syncToSAB(sEProjs, base);
        }
    }
}