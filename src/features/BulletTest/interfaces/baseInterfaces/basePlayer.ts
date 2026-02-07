import { IPlayer } from '../IPlayer';
import { BHConfig } from "../../model/BHConfig";
import { IHitbox } from "../IEntity";

export class basePlayer implements IPlayer {
    private static instance: basePlayer;
    active: boolean;
    height: number;
    hitbox: IHitbox;
    hp: number;
    moveSpeed: number;
    vx: number;
    vy: number;
    width: number;
    seed: number;
    playerRelative: number;
    x: number;
    y: number;

    private currentFrame: number = 0;
    private lastHitFrame: number = 0;
    private fireFlag: boolean = false;
    private config: any;

    private constructor() {
        this.active = true;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.playerRelative = 0; //It is itself... Might be usable for tracking mouse
        this.hitbox = {offsetX: 0, offsetY: 0}
        this.height = 0;
        this.width = 0;
        this.hp = 100;
        this.moveSpeed = 0;
        this.seed = Math.random() * 1000;
    }

    //Forcing singleton
    public static getInstance(): basePlayer {
        if (!basePlayer.instance) {
            basePlayer.instance = new basePlayer();
        }
        return basePlayer.instance;
    }

    public applyConfig(config: BHConfig): void {
        this.config = config;
        this.hp = config.initialHP;
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
        if (amount < 0) this.triggerHitCooldown();
    }

    public triggerHitCooldown(): void {
        this.lastHitFrame = this.currentFrame;
    }

    //If we ever need to pass more than one action, consider an object: {action: boolean, item1: state, item2: state}
    public playerAction(): boolean {
        const chalEnd = this.fireFlag;
        this.fireFlag = false;
        return chalEnd;
    }

    public updatePlayer(inputState: any, config: BHConfig, frameCount: number): void {
        this.currentFrame = frameCount;
        this.update(inputState, config);
    }

    //This one in particular should be private, might need refactoring if we want this to be more clean...
    public update(inputState: any, config: BHConfig): void {
        const actions = inputState;
        if (actions === undefined) return;
        let targetVx = 0;
        let targetVy = 0;

        if (actions.includes('MOVE_UP')) targetVy = -this.moveSpeed;
        if (actions.includes('MOVE_DOWN')) targetVy = this.moveSpeed;
        if (actions.includes('MOVE_LEFT')) targetVx = -this.moveSpeed;
        if (actions.includes('MOVE_RIGHT')) targetVx = this.moveSpeed;

        this.setMovement(targetVx, targetVy);

        if (this.currentFrame - this.lastHitFrame > 120 && this.hp < 100) {
            this.hp = Math.min(100, this.hp + (this.hp < 25 ? 0.3 : 0.1));
        }

        this.x = Math.max(0, Math.min(this.config.width, this.x + this.vx));
        this.y = Math.max(0, Math.min(this.config.height, this.y + this.vy));
    }
}
