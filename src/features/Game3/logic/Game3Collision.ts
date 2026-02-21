// src/features/Game3/logic/Game3Collision.ts
import { Game3Logic } from './Game3Logic';
import { PlatformData } from './Game3MapData';

export class Game3Collision {
    constructor(private logic: Game3Logic) {}

    public checkIsOnGround(): boolean {
        const hero = this.logic.heroState;
        const { width, height } = this.logic.dimensions;
        const platforms = this.logic.platformList;

        const checkY = hero.y + height + 0.1;

        for (const p of platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue;

            if (p.isFallthrough) {
                if (this.logic.isAction('MOVE_DOWN')) continue;
                if (hero.y + height > p.y + 0.1) continue;
            }

            if (
                hero.x + width > p.x &&
                hero.x < p.x + p.width &&
                checkY > p.y &&
                hero.y + height <= p.y
            ) {
                return true;
            }
        }
        return false;
    }

    public getWallCollision(): number {
        const hero = this.logic.heroState;
        const { width, height } = this.logic.dimensions;
        const platforms = this.logic.platformList;
        const checkDist = 0.1;

        for (const p of platforms) {
            if (p.isWall &&
                hero.x <= p.x + p.width && hero.x + checkDist > p.x + p.width &&
                hero.y + height > p.y && hero.y < p.y + p.height) {
                return -1;
            }
        }
        for (const p of platforms) {
            if (p.isWall &&
                hero.x + width >= p.x && hero.x + width - checkDist < p.x &&
                hero.y + height > p.y && hero.y < p.y + p.height) {
                return 1;
            }
        }
        return 0;
    }

    public resolveMovement() {
        const hero = this.logic.heroState;
        const { width, height } = this.logic.dimensions;
        const platforms = this.logic.platformList;

        const nextX = hero.x + hero.vx;

        // Horizontal Collision
        for (const p of platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue;
            if (p.isFallthrough) continue;

            if (nextX + width > p.x && nextX < p.x + p.width && hero.y + height > p.y && hero.y < p.y + p.height) {
                if (nextX > hero.x) hero.x = p.x - width;
                else if (nextX < hero.x) hero.x = p.x + p.width;
                hero.vx = 0;
                break;
            }
        }
        if (hero.vx !== 0) hero.x = nextX;

        // Vertical Collision
        const nextY = hero.y + hero.vy;
        let verticalCollided = false;

        for (const p of platforms) {
            if (p.isSpike || p.isPortal || p.isVoid || p.isExit) continue;

            if (p.isFallthrough) {
                if (hero.vy < 0) continue;
                if (this.logic.isAction('MOVE_DOWN')) continue;
                if (hero.y + height > p.y + 0.1) continue;
            }

            if (hero.x + width > p.x && hero.x < p.x + p.width && nextY + height > p.y && nextY < p.y + p.height) {
                if (nextY > hero.y) {
                    hero.y = p.y - height;
                    this.logic.isJumping = false; // Using the public setter
                } else if (nextY < hero.y) {
                    hero.y = p.y + p.height;
                    this.logic.isJumping = false; // Using the public setter
                }
                hero.vy = 0;
                verticalCollided = true;
                break;
            }
        }
        if (!verticalCollided) hero.y = nextY;
    }

    public checkHazardCollision(property: 'isSpike' | 'isVoid' | 'isPortal' | 'isExit'): boolean {
        return !!this.getCollidingPlatform(property);
    }

    public getCollidingPlatform(property: 'isSpike' | 'isVoid' | 'isPortal' | 'isExit'): PlatformData | undefined {
        const hero = this.logic.heroState;
        const { width, height } = this.logic.dimensions;
        const platforms = this.logic.platformList;
        const padding = 0.05;

        for (const p of platforms) {
            if (p[property] &&
                hero.x + width - padding > p.x &&
                hero.x + padding < p.x + p.width &&
                hero.y + height - padding > p.y &&
                hero.y + padding < p.y + p.height) {
                return p;
            }
        }
        return undefined;
    }
}