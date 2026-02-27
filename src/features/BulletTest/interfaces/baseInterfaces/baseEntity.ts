// src/features/BulletTest/interfaces/baseInterfaces/baseEntity.ts
import { IEntity, IHitbox } from "../IEntity";
import { IContactEnemy } from "../IEnemy";
import { IRangedEnemy } from "../IEnemy";
import { basePlayer } from "./basePlayer";
import { BHConfig } from "../../model/BHConfig";
import { enemyProjectile } from "./baseProjectile";

export abstract class baseEntity implements IEntity {
    active: boolean;
    height: number;
    playerRelative: number;
    hitbox: IHitbox;
    seed: number;
    width: number;
    health: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: string;
    currentFrame: number;

    protected constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.health = 0;
        this.hitbox = { offsetX: 0, offsetY: 0 };
        this.height = 0;
        this.width = 0;
        this.seed = Math.random() * 1000;
        this.active = false;
        this.playerRelative = 0;
        this.type = "unknown";
        this.currentFrame = 0;
    }

    abstract update(player: basePlayer, config: BHConfig): void;
    abstract orientation(player: basePlayer): void;
    abstract syncToSAB(sharedView: Float32Array, base: number): void;

    modifyHP(points: number) {
        if (this.active) {
            this.health += points;
        }
        if (this.health < 0) {
            this.active = false;
        }
    }
}

export class RockEntity extends baseEntity implements IContactEnemy {
    damageType: 'contact' = 'contact';
    hp: number = 0;
    maxHp: number = 0;
    moveSpeed: number = 0;
    contactDamage: number = 0.2;
    wave: number = 0;

    private timeElapsed: number;
    private atkBox: { eX: number, eY: number };
    private followRun: boolean;
    private primedMode: boolean;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 52;
        this.health = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.timeElapsed = Date.now() + Math.random() * 1000;
        this.atkBox = { eX: 0, eY: 0 };
        this.followRun = false;
        this.primedMode = false;
        this.active = true;
        this.type = "rock";
    }

    applySpawnConfig(hp: number, moveSpeed: number, contactDamage: number, wave: number): void {
        this.hp = hp;
        this.maxHp = hp;
        this.health = hp;
        this.moveSpeed = moveSpeed;
        this.contactDamage = contactDamage;
        this.wave = wave;
    }

    update(player: basePlayer, config: BHConfig): void {
        this.orientation(player);
        this.processRock(player, config);
        this.processRockAttacks(player, config);
        this.currentFrame += 0.05;
    }

    orientation(player: basePlayer): void {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.playerRelative = Math.atan2(dy, dx);
    }

    syncToSAB(sharedView: Float32Array, base: number): void {
        sharedView[base] = this.x;
        sharedView[base + 1] = this.y;
        sharedView[base + 2] = this.seed;
        sharedView[base + 3] = this.primedMode ? 1 : 0;
        sharedView[base + 4] = this.atkBox.eX;
        sharedView[base + 5] = this.atkBox.eY;
        sharedView[base + 6] = this.width;
        sharedView[base + 7] = this.height;
        sharedView[base + 8] = this.currentFrame;
        sharedView[base + 9] = 0; //contact
    }

    private processRock(player: basePlayer, config: BHConfig): void {
        if (this.primedMode) return;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = dx * dx + dy * dy;
        const sqDistance = Math.floor(Math.sqrt(dx * dx + dy * dy));
        const speed = this.moveSpeed > 0 ? this.moveSpeed : config.moveSpeed - 1;

        this.followRun = sqDistance >= 200 && sqDistance <= 250;

        if (this.followRun) {
            this.vx *= 0;
            this.vy *= 0;
        } else {
            this.vx = Math.floor(Math.abs(Math.cos(this.playerRelative)*speed));
            this.vy = Math.floor(Math.abs(Math.sin(this.playerRelative)*speed));
            if (sqDistance >= 200) {
                this.vx *= dx > 0 ? -1 : 1;
                this.vy *= dy > 0 ? -1 : 1;
            }
            if (sqDistance <= 250) {
                this.vx *= dx > 0 ? 1 : -1;
                this.vy *= dy > 0 ? 1 : -1;
            }
        }

        this.vx = this.x <= 0 ? 1 : this.vx;
        this.vx = this.x >= config.width ? -1 : this.vx;
        this.vy = this.y <= 0 ? 1 : this.vy;
        this.vy = this.y >= config.height ? -1 : this.vy;

        this.x += this.vx;
        this.y += this.vy;

        if (distance < 1600) {
            this.vx *= -1;
            this.vy *= -1;
            player.modifyHp(-this.contactDamage);
            self.postMessage({ type: 'EVENT', name: 'EXPLOSION_REQ' });
        }
    }

    private processRockAttacks(player: basePlayer, config: BHConfig): void {
        const timeMili = (Date.now() - this.timeElapsed);
        if (timeMili > 5000 && !this.primedMode) {
            this.primedMode = true;
            this.atkBox = { eX: player.x, eY: player.y };
        }

        if (this.primedMode && timeMili > 7000) {
            const slope = (this.atkBox.eY - this.y) / (this.atkBox.eX - this.x);
            const regnum = this.y - (slope * this.x);
            const top = Math.abs(slope * player.x + -1 * player.y + regnum);
            const bot = Math.sqrt(slope * slope + 1);
            const distanceLines = top / bot;

            if (distanceLines < 30
                && Math.min(this.atkBox.eX, this.x) <= player.x && player.x <= Math.max(this.atkBox.eX, this.x)
                && Math.min(this.atkBox.eY, this.y) <= player.y && player.y <= Math.max(this.atkBox.eY, this.y)) {
                player.modifyHp(-10);
            }
            this.timeElapsed = Date.now();
            this.primedMode = false;
            this.atkBox = { eX: 0, eY: 0 };
        }
    }
}

export class ShotEntity extends baseEntity implements IRangedEnemy {
    damageType: 'ranged' = 'ranged';
    hp: number = 0;
    maxHp: number = 0;
    moveSpeed: number = 0;
    fireRate: number = 5000;
    lastShotFrame: number = 0;
    projectileDamage: number = 20;
    wave: number = 0;

    private timeElapsed: number;
    private followRun: boolean;
    private primedMode: boolean;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 52;
        this.health = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.timeElapsed = Date.now() + Math.random() * 1000;
        this.followRun = false;
        this.primedMode = false;
        this.active = true;
        this.type = "singleShot";
    }

    applySpawnConfig(hp: number, moveSpeed: number, fireRate: number, projectileDamage: number, wave: number): void {
        this.hp = hp;
        this.maxHp = hp;
        this.health = hp;
        this.moveSpeed = moveSpeed;
        this.fireRate = fireRate;
        this.projectileDamage = projectileDamage;
        this.wave = wave;
    }

    updateProjectile(player: basePlayer, config: BHConfig, currentShots: enemyProjectile[]): void {
        this.update(player, config);
        this.fireProjectiles(player, currentShots);
    }

    update(player: basePlayer, config: BHConfig): void {
        this.orientation(player);
        this.processShot(player, config);
        this.currentFrame += 0.05;
    }

    fireProjectiles(player: basePlayer, currentShots: enemyProjectile[]): void {
        this.processShotAttacks(player, currentShots);
    }

    orientation(player: basePlayer): void {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.playerRelative = Math.atan2(dy, dx);
    }

    syncToSAB(sharedView: Float32Array, base: number): void {
        sharedView[base] = this.x;
        sharedView[base + 1] = this.y;
        sharedView[base + 2] = this.seed;
        sharedView[base + 3] = this.primedMode ? 1 : 0;
        // 4 and 5 are for atkBox in RockEntity, leaving empty here
        sharedView[base + 6] = this.width;
        sharedView[base + 7] = this.height;
        sharedView[base + 8] = this.currentFrame;
        sharedView[base + 9] = 1; //ranged
    }

    private processShot(player: basePlayer, config: BHConfig): void {
        if (this.primedMode) return;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = dx * dx + dy * dy;
        const sqDistance = Math.floor(Math.sqrt(dx * dx + dy * dy));
        const speed = this.moveSpeed > 0 ? this.moveSpeed : config.moveSpeed - 1;

        this.followRun = sqDistance > 200 && sqDistance < 250;

        if (this.followRun) {
            this.vx *= 0;
            this.vy *= 0;
        } else {
            this.vx = Math.floor(Math.abs(Math.cos(this.playerRelative)*speed));
            this.vy = Math.floor(Math.abs(Math.sin(this.playerRelative)*speed));
            if (sqDistance > 200) {
                this.vx *= dx > 0 ? -1 : 1;
                this.vy *= dy > 0 ? -1 : 1;
            }
            if (sqDistance < 250) {
                this.vx *= dx > 0 ? 1 : -1;
                this.vy *= dy > 0 ? 1 : -1;
            }
        }

        this.vx = this.x <= 0 ? 1 : this.vx;
        this.vx = this.x >= config.width ? -1 : this.vx;
        this.vy = this.y <= 0 ? 1 : this.vy;
        this.vy = this.y >= config.height ? -1 : this.vy;

        this.x = Math.floor(this.x + this.vx);
        this.y = Math.floor(this.y + this.vy);

        if (distance < 1600) {
            this.vx *= -1;
            this.vy *= -1;
            player.modifyHp(-0.2);
            self.postMessage({ type: 'EVENT', name: 'EXPLOSION_REQ' });
        }
    }

    private processShotAttacks(player: basePlayer, currentShots: enemyProjectile[]): void {
        const timeMili = (Date.now() - this.timeElapsed);
        if (timeMili > this.fireRate + Math.floor(Math.random() * 3000) && !this.primedMode) {
            this.primedMode = true;
        }

        if (this.primedMode) {
            currentShots.push(new enemyProjectile(this.x, this.y, player.x, player.y));
            this.timeElapsed = Date.now();
            this.primedMode = false;
        }
    }
}