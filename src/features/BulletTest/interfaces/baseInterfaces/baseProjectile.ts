import {IHitbox} from "../IEntity";
import {basePlayer} from "./basePlayer";
import {BHConfig} from "../../model/BHConfig";
import {IProjectile} from "../IProjectile";

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
        this.hitbox = {offsetX: 0, offsetY: 0}
        this.playerRelative = 0;
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
        this.damage = -0.2;
        this.height = 20;
        this.width = 20;
    }

    update(player: basePlayer, config: BHConfig): void {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > config.width
        || this.y < 0 || this.y > config.height) {
            this.active = false;
        }
    }

    syncToSAB(sharedView: Float32Array, base: number): void {
        sharedView[base] = this.x;
        sharedView[base + 1] = this.y;
    }
}