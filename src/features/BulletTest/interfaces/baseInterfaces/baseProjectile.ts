import {IHitbox} from "../IEntity";
import {basePlayer} from "./basePlayer";
import {BHConfig} from "../../model/BHConfig";
import {IProjectile} from "../IProjectile";
import {baseEntity} from "./baseEntity";

export abstract class baseProjectile implements IProjectile {
    seed: number;
    height: number;
    width: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    active: boolean;
    hitbox: IHitbox;
    playerRelative: number;
    type: string;

    protected constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage = 0;
        this.height = 0;
        this.width = 0;
        this.seed = Math.random() * 1000;
        this.active = false;
        this.hitbox = {offsetX: 0, offsetY: 0};
        this.playerRelative = 0;
        this.type = "projectile";
    }

    abstract update(player: basePlayer, config: BHConfig): void;

}

export class playerProjectile extends baseProjectile {

    private speed: number = 8;

    constructor(x: number, y: number, inputState: any, config: BHConfig) {
        super(x, y);
        this.active = true;
        const dx = config.width*inputState.mouseX - this.x;
        const dy = config.height*inputState.mouseY - this.y;
        this.playerRelative = Math.atan2(dy, dx);
        this.vx = Math.cos(this.playerRelative) * this.speed;
        this.vy = Math.sin(this.playerRelative) * this.speed;
        this.damage = -20;
        this.height = 20;
        this.width = 20;
        this.type = "bullet";
    }

    update(player: basePlayer, config: BHConfig): void {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > config.width
            || this.y < 0 || this.y > config.height) {
            this.active = false;
        }
    }

    collided(entity: baseEntity[]) {
        //this does NOT handle when projectiles are bigger than the entity
        for (const holder of entity) {
            if (!this.active) break;
            if (!holder.active) continue;
            if (this.x < holder.x + holder.width && this.x + this.width > holder.x &&
                this.y < holder.y + holder.height && this.y + this.height > holder.y) {
                holder.modifyHP(this.damage);
                this.active = false;
            }
            if (holder.health <= 0) holder.active = false;
        }
    }

    syncToSAB(sharedView: Float32Array, base: number): void {
        sharedView[base] = this.x;
        sharedView[base + 1] = this.y;
        sharedView[base + 2] = this.width;
        sharedView[base + 3] = this.height;
        sharedView[base + 4] = this.seed;
    }
}

export class enemyProjectile extends baseProjectile {

    private speed: number = 8;

    constructor(x: number, y: number, playerX: number, playerY: number) {
        super(x, y);
        this.active = true;
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        this.playerRelative = Math.atan2(dy, dx);
        this.vx = Math.cos(this.playerRelative) * this.speed;
        this.vy = Math.sin(this.playerRelative) * this.speed;
        this.damage = -20;
        this.height = 20;
        this.width = 20;
        this.type = "onebullet";
    }

    update(player: basePlayer, config: BHConfig): void {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > config.width
            || this.y < 0 || this.y > config.height) {
            this.active = false;
        }
    }

    collided(entity: basePlayer) {
        //this does NOT handle when projectiles are bigger than the entity
        if (!this.active) return;
        if (this.x < entity.x + entity.width && this.x + this.width > entity.x &&
            this.y < entity.y + entity.height && this.y + this.height > entity.y) {
            entity.modifyHp(this.damage);
            this.active = false;
        }
    }

    syncToSAB(sharedView: Float32Array, base: number): void {
        sharedView[base] = this.x;
        sharedView[base + 1] = this.y;
        sharedView[base + 2] = this.width;
        sharedView[base + 3] = this.height;
        sharedView[base + 4] = this.seed;
    }
}