// src/features/BulletTest/interfaces/baseInterfaces/basePlayer.ts
import { IPlayer } from '../IPlayer';
import { BHConfig } from "../../model/BHConfig";
import { IHitbox } from "../IEntity";
import { playerProjectile } from "./baseProjectile";

export class basePlayer implements IPlayer {
    private static instance: basePlayer;
    active: boolean;
    height: number;
    hitbox: IHitbox;
    hp: number;
    health: number;
    moveSpeed: number;
    vx: number;
    vy: number;
    width: number;
    seed: number;
    playerRelative: number;
    x: number;
    y: number;
    type: string;

    private currentFrame: number = 0;
    private lastHitFrame: number = 0;
    private bulletTime: number = Date.now();
    private fireFlag: boolean = false;
    private config: any;

    private constructor() {
        this.active = true;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.playerRelative = 0;
        this.hitbox = { offsetX: 0, offsetY: 0 };
        this.height = 30;
        this.width = 30;
        this.hp = 100;
        this.health = 100;
        this.moveSpeed = 0;
        this.seed = Math.random() * 1000;
        this.type = "player";
    }

    public static getInstance(): basePlayer {
        if (!basePlayer.instance) {
            basePlayer.instance = new basePlayer();
        }
        return basePlayer.instance;
    }

    public applyConfig(config: BHConfig): void {
        this.config = config;
        this.hp = config.initialHP;
        this.health = config.initialHP;
        this.x = config.heroStartX;
        this.y = config.heroStartY;
        this.moveSpeed = config.moveSpeed;
    }

    public setMovement(vx?: number, vy?: number): void {
        if (vx !== undefined) this.vx = vx;
        if (vy !== undefined) this.vy = vy;
    }

    public modifyHp(amount: number): void {
        this.hp = Math.max(0, Math.min(100, this.hp + amount));
        this.health = this.hp;
        if (amount < 0) this.triggerHitCooldown();
    }

    public modifyHP(points: number): void {
        this.modifyHp(points);
    }

    public triggerHitCooldown(): void {
        this.lastHitFrame = this.currentFrame;
    }

    public playerAction(): boolean {
        const chalEnd = this.fireFlag;
        this.fireFlag = false;
        return chalEnd;
    }

    public fireProjectile(inputState: any, config: BHConfig): playerProjectile {
        return new playerProjectile(this.x, this.y, inputState, config);
    }

    public updatePlayer(inputState: any, config: BHConfig, frameCount: number): void {
        this.currentFrame = frameCount;
        this.update(inputState, config);
    }

    public update(inputState: any, config: BHConfig): void {
        const actions = inputState.actions;
        if (actions === undefined) return;
        let targetVx = 0;
        let targetVy = 0;

        if (actions.includes('MOVE_UP')) targetVy = -this.moveSpeed;
        if (actions.includes('MOVE_DOWN')) targetVy = this.moveSpeed;
        if (actions.includes('MOVE_LEFT')) targetVx = -this.moveSpeed;
        if (actions.includes('MOVE_RIGHT')) targetVx = this.moveSpeed;

        if (inputState.isMouseDown && this.bulletTime + 250 < Date.now()) {
            this.bulletTime = Date.now();
            this.fireFlag = true;
        }

        this.setMovement(targetVx, targetVy);

        if (this.currentFrame - this.lastHitFrame > 120 && this.hp < 100) {
            this.hp = Math.min(100, this.hp + (this.hp < 25 ? 0.3 : 0.1));
            this.health = this.hp;
        }

        this.x = Math.max(0, Math.min(this.config.width, this.x + this.vx));
        this.y = Math.max(0, Math.min(this.config.height, this.y + this.vy));
    }

    public orientation(target: any): void {
        // Player doesn't need orientation toward itself
    }

    public syncToSAB(sharedView: Float32Array, base: number): void {
        // Player sync is handled directly in BHTestLogic.syncToSAB
    }
}