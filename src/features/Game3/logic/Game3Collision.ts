// src/features/Game3/logic/Game3Collision.ts
import { Game3Logic } from './Game3Logic';
import { PlatformData } from '../data/Game3MapData';

export class Game3Collision {
    constructor(private logic: Game3Logic) {}

    public checkIsOnGround(): boolean {
        const checkY = this.logic.hero.y + this.logic.heroHeight + 0.1;
        for (const p of this.logic.platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue;
            if (
                this.logic.hero.x + this.logic.heroWidth > p.x &&
                this.logic.hero.x < p.x + p.width &&
                checkY > p.y &&
                this.logic.hero.y + this.logic.heroHeight <= p.y
            ) {
                return true;
            }
        }
        return false;
    }

    public getWallCollision(): number {
        const checkDist = 0.1;
        for (const p of this.logic.platforms) {
            if (p.isWall &&
                this.logic.hero.x <= p.x + p.width && this.logic.hero.x + checkDist > p.x + p.width &&
                this.logic.hero.y + this.logic.heroHeight > p.y && this.logic.hero.y < p.y + p.height) {
                return -1;
            }
        }
        for (const p of this.logic.platforms) {
            if (p.isWall &&
                this.logic.hero.x + this.logic.heroWidth >= p.x && this.logic.hero.x + this.logic.heroWidth - checkDist < p.x &&
                this.logic.hero.y + this.logic.heroHeight > p.y && this.logic.hero.y < p.y + p.height) {
                return 1;
            }
        }
        return 0;
    }

    public resolveMovement() {
        const nextX = this.logic.hero.x + this.logic.hero.vx;

        for (const p of this.logic.platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue;
            if (nextX + this.logic.heroWidth > p.x && nextX < p.x + p.width && this.logic.hero.y + this.logic.heroHeight > p.y && this.logic.hero.y < p.y + p.height) {
                if (nextX > this.logic.hero.x) this.logic.hero.x = p.x - this.logic.heroWidth;
                else if (nextX < this.logic.hero.x) this.logic.hero.x = p.x + p.width;
                this.logic.hero.vx = 0;
                break;
            }
        }
        if (this.logic.hero.vx !== 0) this.logic.hero.x = nextX;

        const nextY = this.logic.hero.y + this.logic.hero.vy;
        let verticalCollided = false;
        for (const p of this.logic.platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue;
            if (this.logic.hero.x + this.logic.heroWidth > p.x && this.logic.hero.x < p.x + p.width && nextY + this.logic.heroHeight > p.y && nextY < p.y + p.height) {
                if (nextY > this.logic.hero.y) {
                    this.logic.hero.y = p.y - this.logic.heroHeight;
                    this.logic.isJumpingFromGround = false;
                } else if (nextY < this.logic.hero.y) {
                    this.logic.hero.y = p.y + p.height;
                    this.logic.isJumpingFromGround = false;
                }
                this.logic.hero.vy = 0;
                verticalCollided = true;
                break;
            }
        }
        if (!verticalCollided) this.logic.hero.y = nextY;
    }

    public checkHazardCollision(property: 'isSpike' | 'isVoid' | 'isPortal' | 'isExit'): boolean {
        return !!this.getCollidingPlatform(property);
    }

    public getCollidingPlatform(property: 'isSpike' | 'isVoid' | 'isPortal' | 'isExit'): PlatformData | undefined {
        const padding = 0.05;
        for (const p of this.logic.platforms) {
            if (p[property] &&
                this.logic.hero.x + this.logic.heroWidth - padding > p.x &&
                this.logic.hero.x + padding < p.x + p.width &&
                this.logic.hero.y + this.logic.heroHeight - padding > p.y &&
                this.logic.hero.y + padding < p.y + p.height) {
                return p;
            }
        }
        return undefined;
    }
}
