// src/features/BulletTest/logic/BHTestLogic.ts
import { BHMainLogicSchema, BHRocksLogicSchema, BHPProjLogicSchema, BHEProjLogicSchema } from '../model/BHLogicSchema';
import { BaseLogic } from '../../../core/templates/BaseLogic';
import { BaseDispatcher } from '../../../core/templates/BaseDispatcher';
import { BHCommands } from './BHCommands';
import { BHConfig } from '../model/BHConfig';
import { basePlayer } from '../interfaces/baseInterfaces/basePlayer';
import {baseEntity, BashEntity, RockEntity, ShotEntity} from '../interfaces/baseInterfaces/baseEntity';
import {BossEntity} from '../interfaces/baseInterfaces/BossEntity';
import {enemyProjectile, playerProjectile} from '../interfaces/baseInterfaces/baseProjectile';
import { WaveManager } from './WaveManager';
import { IWaveDefinition } from '../interfaces/IRoom';
import waveData from '../data/bh_waves.json';
import { ITEM_NONE, SHOP_ITEM_POOL, getItemDef } from '../../../core/inventory/ItemRegistry';

interface WaveLevelData {
    waves: IWaveDefinition[];
}

// Point values for enemy kills
const CONTACT_ENEMY_POINTS = 50;
const RANGED_ENEMY_POINTS = 75;
const BOSS_KILL_POINTS = 500;

// Coin ranges for enemy kills (random between min and max inclusive)
const MINION_COIN_MIN = 0;
const MINION_COIN_MAX = 5;
const BOSS_COIN_REWARD = 25;

// Boss HP constants
const BOSS_MAX_HP = 1000;
// Phase thresholds: boss is vulnerable until HP drops to this target, then goes invulnerable
// Phase 1: 1000 → 667  (bar shows 3/3 → 2/3)
// Phase 2: 667 → 333   (bar shows 2/3 → 1/3)
// Phase 3: 333 → 0     (bar shows 1/3 → 0)
const BOSS_PHASE_THRESHOLDS = [667, 333, 0];

// Item drop pickup radius
const ITEM_PICKUP_RADIUS = 40;

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
    private bossTargetHp: number = BOSS_PHASE_THRESHOLDS[0];
    private bossRewardGiven: boolean = false;

    // Wave system
    private waveManager: WaveManager = new WaveManager();
    private wavesStarted: boolean = false;

    // Exit door
    private exitDoorActive: boolean = false;
    private exitDoorX: number = 0;
    private exitDoorY: number = 0;
    private static readonly DOOR_SIZE = 60;
    private exitDoorEntered: boolean = false;

    // Economy — persisted cross-game via session
    private points: number = 0;
    private coins: number = 0;

    // Inventory — single held item, persisted cross-game via session
    private heldItemId: number = ITEM_NONE;

    // Item drop 1 (Health Potion) — left side of portal
    private itemDropActive: boolean = false;
    private itemDropX: number = 0;
    private itemDropY: number = 0;
    private itemDropType: number = ITEM_NONE;
    private itemDropFree: boolean = false; // true when item was swapped back (no cost)

    // Item drop 2 (Life Totem) — right side of portal
    private itemDrop2Active: boolean = false;
    private itemDrop2X: number = 0;
    private itemDrop2Y: number = 0;
    private itemDrop2Type: number = ITEM_NONE;
    private itemDrop2Free: boolean = false; // true when item was swapped back (no cost)

    private itemDropSpawned: boolean = false; // prevents re-spawning both drops
    private pickupRequested: boolean = false; // set by PICKUP_ITEM command (E key), consumed each frame

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

        // Reset item drop state
        this.itemDropActive = false;
        this.itemDrop2Active = false;
        this.itemDropSpawned = false;
        this.itemDropFree = false;
        this.itemDrop2Free = false;
        this.itemDropX = 0;
        this.itemDropY = 0;
        this.itemDropType = ITEM_NONE;
        this.itemDrop2X = 0;
        this.itemDrop2Y = 0;
        this.itemDrop2Type = ITEM_NONE;

        const levelLabel = this.config!.levelLabel || "Level 1";
        this.bossLevel = levelLabel === "Level 4";
        this.bossRewardGiven = false;
        if (this.bossLevel) {
            this.boss = new BossEntity(config.width / 2 - 100, 50);
            this.bossTargetHp = BOSS_PHASE_THRESHOLDS[0]; // 667 — first vulnerable window
        } else {
            this.boss = null;
        }

        // Restore economy from config if provided (session overrides flow through config)
        if ((config as any).initialPoints !== undefined) {
            this.points = (config as any).initialPoints;
        }
        if ((config as any).initialCoins !== undefined) {
            this.coins = (config as any).initialCoins;
        }

        // Restore inventory from config if provided (session overrides)
        if ((config as any).initialHeldItem !== undefined) {
            this.heldItemId = (config as any).initialHeldItem;
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
            boss: this.boss ? { ...this.boss } : null,
            bossLevel: this.bossLevel,
            bossTargetHp: this.bossTargetHp,
            bossRewardGiven: this.bossRewardGiven,
            playerProjectiles: [...this.playerProjectiles],
            enemyProjectiles: [...this.enemyProjectiles],
            currentFrame: this.currentFrame,
            config: this.config,
            waveSnapshot: this.waveManager.getSnapshot(),
            wavesStarted: this.wavesStarted,
            points: this.points,
            coins: this.coins,
            heldItemId: this.heldItemId,
            itemDropActive: this.itemDropActive,
            itemDropX: this.itemDropX,
            itemDropY: this.itemDropY,
            itemDropType: this.itemDropType,
            itemDrop2Active: this.itemDrop2Active,
            itemDrop2X: this.itemDrop2X,
            itemDrop2Y: this.itemDrop2Y,
            itemDrop2Type: this.itemDrop2Type,
            itemDropFree: this.itemDropFree,
            itemDrop2Free: this.itemDrop2Free,
            itemDropSpawned: this.itemDropSpawned
        };
    }

    public override loadSnapshot(data: any): void {
        if (!data) return;
        this.config = data.config;

        if (data.player) {
            Object.assign(this.player, data.player);
        }

        if (data.boss) {
            this.boss = Object.assign(Object.create(BossEntity.prototype), data.boss);
            this.bossLevel = data.bossLevel ?? false;
            this.bossTargetHp = data.bossTargetHp ?? 0;
            this.bossRewardGiven = data.bossRewardGiven ?? false;
        } else {
            this.boss = null;
            this.bossLevel = false;
        }

        if (data.entities) {
            this.entities = data.entities.map((eData: any) => {
                let proto;
                switch (eData.type) {
                    case "rock":
                        proto = RockEntity.prototype;
                        break;
                    case "singleShot":
                        proto = ShotEntity.prototype;
                        break;
                    case "bash":
                        proto = BashEntity.prototype;
                        break;
                    default:
                        console.warn(`Unknown entity type: ${eData.type}`);
                        proto = RockEntity.prototype;
                }

                return Object.assign(Object.create(proto), eData);
            });
        }

        if (data.boss) {
            this.boss = Object.assign(Object.create(BossEntity.prototype), data.boss);
            this.bossLevel = data.bossLevel ?? true;
            this.bossTargetHp = data.bossTargetHp ?? 0;
            this.bossRewardGiven = data.bossRewardGiven ?? false;
        }

        if (data.playerProjectiles) {
            this.playerProjectiles = data.playerProjectiles.map((pData: any) => {
                const proj = Object.create(playerProjectile.prototype);
                return Object.assign(proj, pData);
            });
        }

        if (data.enemyProjectiles) {
            this.enemyProjectiles = data.enemyProjectiles.map((pData: any) => {
                const proj = Object.create(enemyProjectile.prototype);
                return Object.assign(proj, pData);
            });
        }

        this.currentFrame = data.currentFrame ?? 0;
        this.wavesStarted = data.wavesStarted ?? false;
        this.points = data.points ?? 0;
        this.coins = data.coins ?? 0;
        this.heldItemId = data.heldItemId ?? ITEM_NONE;
        this.itemDropActive = data.itemDropActive ?? false;
        this.itemDropX = data.itemDropX ?? 0;
        this.itemDropY = data.itemDropY ?? 0;
        this.itemDropType = data.itemDropType ?? ITEM_NONE;
        this.itemDrop2Active = data.itemDrop2Active ?? false;
        this.itemDrop2X = data.itemDrop2X ?? 0;
        this.itemDrop2Y = data.itemDrop2Y ?? 0;
        this.itemDrop2Type = data.itemDrop2Type ?? ITEM_NONE;
        this.itemDropFree = data.itemDropFree ?? false;
        this.itemDrop2Free = data.itemDrop2Free ?? false;
        this.itemDropSpawned = data.itemDropSpawned ?? false;
        if (data.waveSnapshot) {
            this.waveManager.loadSnapshot(data.waveSnapshot);
        }
        this.isInitialized = true;
    }

    /**
     * Request an item pickup on the next frame. Called via PICKUP_ITEM command (E key).
     */
    public requestPickup(): void {
        this.pickupRequested = true;
    }

    /**
     * Use the currently held item. Called via USE_ITEM command (Q key).
     * Passive items (like Life Totem) cannot be manually used.
     */
    public useHeldItem(): void {
        if (this.heldItemId === ITEM_NONE) return;

        const def = getItemDef(this.heldItemId);
        if (!def || !def.onUse) return;

        // Passive items trigger automatically (e.g. Life Totem on death), not via Q
        if (def.passive) return;

        const result = def.onUse({ hp: this.player.hp, maxHp: 100 });
        if (!result) return; // Item says don't consume (e.g. HP already full)

        if (result.hpDelta) {
            this.player.modifyHp(result.hpDelta);
        }

        // Consume the item
        this.heldItemId = ITEM_NONE;
        self.postMessage({ type: 'EVENT', name: 'ITEM_USED' });
    }

    /**
     * Attempt to auto-trigger a passive held item on death.
     * Returns true if the player was revived.
     */
    private tryPassiveRevive(): boolean {
        if (this.heldItemId === ITEM_NONE) return false;

        const def = getItemDef(this.heldItemId);
        if (!def || !def.passive || !def.onUse) return false;

        const result = def.onUse({ hp: 0, maxHp: 100 });
        if (!result || !result.revive) return false;

        // Revive the player
        const healAmount = result.hpDelta ?? 50;
        this.player.modifyHp(healAmount);

        // Consume the totem
        this.heldItemId = ITEM_NONE;
        self.postMessage({ type: 'EVENT', name: 'ITEM_USED' });
        self.postMessage({ type: 'EVENT', name: 'PLAYER_REVIVED' });
        return true;
    }

    /**
     * Try to pick up an item drop. Charges coin cost unless the drop is free (swapped back).
     * If already holding an item, the old item is placed back at the drop location as a free drop.
     * `dropSlot` is 1 or 2 so we know which drop fields to update on swap.
     * Returns true if pickup succeeded.
     */
    private tryPickupDrop(dropSlot: 1 | 2): boolean {
        const dropX = dropSlot === 1 ? this.itemDropX : this.itemDrop2X;
        const dropY = dropSlot === 1 ? this.itemDropY : this.itemDrop2Y;
        const dropType = dropSlot === 1 ? this.itemDropType : this.itemDrop2Type;
        const isFree = dropSlot === 1 ? this.itemDropFree : this.itemDrop2Free;

        const dx = this.player.x - dropX;
        const dy = this.player.y - dropY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= ITEM_PICKUP_RADIUS) return false;

        // Don't pick up the same item type you're already holding
        if (this.heldItemId === dropType) return false;

        // Check coin cost (free drops cost nothing)
        if (!isFree) {
            const def = getItemDef(dropType);
            const cost = def?.cost ?? 0;
            if (this.coins < cost) return false;
            this.coins -= cost;
        }

        const previousItem = this.heldItemId;
        this.heldItemId = dropType;
        self.postMessage({ type: 'EVENT', name: 'ITEM_PICKED_UP', payload: { itemId: dropType } });

        // If we were holding an old item, leave it on the floor at this drop's position (free)
        if (previousItem !== ITEM_NONE) {
            if (dropSlot === 1) {
                this.itemDropType = previousItem;
                this.itemDropFree = true;
            } else {
                this.itemDrop2Type = previousItem;
                this.itemDrop2Free = true;
            }
            // Drop stays active with the swapped item
            return true;
        }

        // No previous item — mark drop type as empty so caller deactivates it
        if (dropSlot === 1) {
            this.itemDropType = ITEM_NONE;
        } else {
            this.itemDrop2Type = ITEM_NONE;
        }
        return true;
    }

    protected onUpdate(sharedView: Float32Array, intView: Int32Array, frameCount: number, fps: number): void {
        if (!this.config) return;
        this.currentFrame = frameCount;

        // Start waves on first update if not already started
        if (!this.wavesStarted) {
            this.waveManager.start();
            this.wavesStarted = true;
        }

        // Update wave manager
        const activeEnemyCount = this.entities.filter(e => e.active).length;
        const newSpawns = this.waveManager.update(activeEnemyCount);

        // Transition waves automatically for non-boss levels
        if (!this.bossLevel && this.waveManager.getState() === 'CLEARED') {
            this.waveManager.nextWave();
        }

        // Boss logic
        if (this.bossLevel && this.boss) {
            const waveState = this.waveManager.getState();

            this.boss.phase = Math.min(3, this.waveManager.getCurrentWave() + 1);

            if (activeEnemyCount > 0 || waveState === 'ACTIVE' || waveState === 'DELAY') {
                this.boss.vulnerable = false;
            } else if (waveState === 'CLEARED' || waveState === 'ALL_CLEARED') {
                if (this.boss.health > this.bossTargetHp) {
                    this.boss.vulnerable = true;
                } else if (this.boss.vulnerable) {
                    this.boss.vulnerable = false;
                    // Advance to next phase threshold
                    const currentPhaseIndex = BOSS_PHASE_THRESHOLDS.indexOf(this.bossTargetHp);
                    if (currentPhaseIndex >= 0 && currentPhaseIndex + 1 < BOSS_PHASE_THRESHOLDS.length) {
                        this.bossTargetHp = BOSS_PHASE_THRESHOLDS[currentPhaseIndex + 1];
                    } else {
                        this.bossTargetHp = 0;
                    }
                    if (waveState === 'CLEARED') {
                        this.waveManager.nextWave();
                    }
                }
            }

            this.boss.update(this.player, this.config);
            this.boss.updateAttacks(this.player, frameCount, this.enemyProjectiles);

            // Award boss kill reward
            if (!this.boss.active && !this.bossRewardGiven) {
                this.bossRewardGiven = true;
                this.points += BOSS_KILL_POINTS;
                this.coins += BOSS_COIN_REWARD;
            }
        }

        if (newSpawns) {
            const newEntities = WaveManager.spawnFromDefinitions(newSpawns, this.config, this.waveManager.getCurrentWave());
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

        for (const proj of this.enemyProjectiles) {
            proj.update(this.player, this.config);
            proj.collided(this.player);
        }

        // Award points/coins for newly-killed enemies before filtering
        for (const entity of this.entities) {
            if (!entity.active && entity.health <= 0) {
                // Determine enemy type for point value
                if (entity.type === "singleShot") {
                    this.points += RANGED_ENEMY_POINTS;
                } else {
                    this.points += CONTACT_ENEMY_POINTS;
                }
                // Random coins 0-5
                this.coins += Math.floor(Math.random() * (MINION_COIN_MAX - MINION_COIN_MIN + 1)) + MINION_COIN_MIN;
            }
        }

        // Clean up dead entities and expired projectiles
        this.playerProjectiles = this.playerProjectiles.filter(proj => proj.active);
        this.enemyProjectiles = this.enemyProjectiles.filter(proj => proj.active);
        this.entities = this.entities.filter(entity => entity.active);

        // Check player death — attempt passive revive first (Life Totem)
        if (this.player.hp <= 0) {
            if (!this.tryPassiveRevive()) {
                self.postMessage({ type: 'EVENT', name: 'PLAYER_DEAD' });
            }
        }

        // Emit room cleared event when all waves done
        const bossCleared = this.bossLevel ? (this.boss && !this.boss.active) : true;
        if (this.waveManager.isAllCleared() && this.entities.length === 0 && bossCleared) {
            self.postMessage({ type: 'EVENT', name: 'ROOM_CLEARED' });

            if (!this.exitDoorActive) {
                this.exitDoorActive = true;
            }

            // Spawn two random shop items after all waves cleared (once per level, not on boss level)
            if (!this.itemDropSpawned && !this.bossLevel) {
                this.itemDropSpawned = true;

                // Pick 2 distinct random items from the pool
                const shuffled = [...SHOP_ITEM_POOL].sort(() => Math.random() - 0.5);
                const item1 = shuffled[0];
                const item2 = shuffled[1];

                // Item 1 — left side of portal
                this.itemDropActive = true;
                this.itemDropX = this.exitDoorX - 80;
                this.itemDropY = this.exitDoorY;
                this.itemDropType = item1;

                // Item 2 — right side of portal
                this.itemDrop2Active = true;
                this.itemDrop2X = this.exitDoorX + 80;
                this.itemDrop2Y = this.exitDoorY;
                this.itemDrop2Type = item2;

                self.postMessage({ type: 'EVENT', name: 'ITEM_SPAWNED', payload: { itemId: item1 } });
                self.postMessage({ type: 'EVENT', name: 'ITEM_SPAWNED', payload: { itemId: item2 } });
            }
        }

        // Check item pickups — only when E key was pressed this frame
        if (this.pickupRequested) {
            this.pickupRequested = false;

            // Check item drop 1 pickup collision
            if (this.itemDropActive) {
                if (this.tryPickupDrop(1)) {
                    if (this.itemDropType === ITEM_NONE) {
                        this.itemDropActive = false;
                    }
                }
            }

            // Check item drop 2 pickup collision
            if (this.itemDrop2Active) {
                if (this.tryPickupDrop(2)) {
                    if (this.itemDrop2Type === ITEM_NONE) {
                        this.itemDrop2Active = false;
                    }
                }
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
        sMain[M.HERO_VX] = this.player.vx;
        sMain[M.HERO_VY] = this.player.vy;
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

        const stateMap: Record<string, number> = {
            'IDLE': 0, 'DELAY': 1, 'ACTIVE': 2, 'CLEARED': 3, 'ALL_CLEARED': 4
        };
        sMain[M.WAVE_STATE] = stateMap[this.waveManager.getState()] ?? 0;

        // Exit door
        sMain[M.EXIT_DOOR_ACTIVE] = this.exitDoorActive ? 1 : 0;
        sMain[M.EXIT_DOOR_X] = this.exitDoorX;
        sMain[M.EXIT_DOOR_Y] = this.exitDoorY;

        const levelLabel = this.config!.levelLabel || "Level 1";
        const levelIndex = levelLabel === "Level 4" ? 3 : levelLabel === "Level 3" ? 2 : levelLabel === "Level 2" ? 1 : 0;
        sMain[M.CURRENT_LEVEL] = levelIndex;

        // Economy
        sMain[M.POINTS] = this.points;
        sMain[M.COINS] = this.coins;

        // Inventory
        sMain[M.HELD_ITEM_ID] = this.heldItemId;

        // Item drop 1
        sMain[M.ITEM_DROP_ACTIVE] = this.itemDropActive ? 1 : 0;
        sMain[M.ITEM_DROP_X] = this.itemDropX;
        sMain[M.ITEM_DROP_Y] = this.itemDropY;
        sMain[M.ITEM_DROP_TYPE] = this.itemDropType;
        sMain[M.ITEM_DROP_FREE] = this.itemDropFree ? 1 : 0;

        // Item drop 2
        sMain[M.ITEM_DROP2_ACTIVE] = this.itemDrop2Active ? 1 : 0;
        sMain[M.ITEM_DROP2_X] = this.itemDrop2X;
        sMain[M.ITEM_DROP2_Y] = this.itemDrop2Y;
        sMain[M.ITEM_DROP2_TYPE] = this.itemDrop2Type;
        sMain[M.ITEM_DROP2_FREE] = this.itemDrop2Free ? 1 : 0;

        if (this.boss) {
            sMain[M.BOSS_HP] = this.boss.health;
            sMain[M.BOSS_VULNERABLE] = this.boss.vulnerable ? 1 : 0;
            sMain[M.BOSS_X] = this.boss.x;
            sMain[M.BOSS_Y] = this.boss.y;
            sMain[M.BOSS_ACTIVE] = this.boss.active ? 1 : 0;

            this.boss.syncAnimToMainSAB(sMain, {
                ANIM_FRAME: M.BOSS_ANIM_FRAME,
                PHASE: M.BOSS_PHASE,
                WIDTH: M.BOSS_WIDTH,
                HEIGHT: M.BOSS_HEIGHT
            });
        } else {
            sMain[M.BOSS_HP] = 0;
            sMain[M.BOSS_VULNERABLE] = 0;
            sMain[M.BOSS_ACTIVE] = 0;
            sMain[M.BOSS_ANIM_FRAME] = 0;
            sMain[M.BOSS_PHASE] = 0;
            sMain[M.BOSS_WIDTH] = 0;
            sMain[M.BOSS_HEIGHT] = 0;
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