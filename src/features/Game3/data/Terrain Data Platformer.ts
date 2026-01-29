// src/features/Game2/data/Terrain Data Platformer.ts

export interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    isFloor?: boolean;
    assetKey?: string;
}

export class TerrainDataPlatformer {
    private platforms: Platform[] = [];

    constructor(platforms: Platform[] = []) {
        this.platforms = platforms;
    }

    public addPlatform(platform: Platform): void {
        this.platforms.push(platform);
    }

    public getPlatforms(): Platform[] {
        return this.platforms;
    }

    /**
     * Checks if a rectangle collides with any platforms.
     * @returns The platform it collided with, or null.
     */
    public checkCollision(x: number, y: number, width: number, height: number): Platform | null {
        for (const platform of this.platforms) {
            if (
                x < platform.x + platform.width &&
                x + width > platform.x &&
                y < platform.y + platform.height &&
                y + height > platform.y
            ) {
                return platform;
            }
        }
        return null;
    }

    /**
     * Specifically checks if an entity is on top of a platform.
     */
    public isOnPlatform(x: number, y: number, width: number, height: number): boolean {
        // Check slightly below the entity
        // We assume y increases downwards.
        return this.checkCollision(x, y + 1, width, height) !== null;
    }

    /**
     * Resolves vertical movement (gravity/jumping) with platform collisions.
     */
    public resolveVerticalMovement(x: number, oldY: number, newY: number, width: number, height: number): { y: number, collided: boolean } {
        const platform = this.checkCollision(x, newY, width, height);
        if (platform) {
            if (newY > oldY) {
                // Moving down (falling), snap to top of platform
                return { y: platform.y - height, collided: true };
            } else {
                // Moving up (jumping), snap to bottom of platform
                return { y: platform.y + platform.height, collided: true };
            }
        }
        return { y: newY, collided: false };
    }

    /**
     * Resolves horizontal movement with platform collisions.
     */
    public resolveHorizontalMovement(oldX: number, newX: number, y: number, width: number, height: number): { x: number, collided: boolean } {
        const platform = this.checkCollision(newX, y, width, height);
        if (platform) {
            if (newX > oldX) {
                // Moving right, snap to left of platform
                return { x: platform.x - width, collided: true };
            } else {
                // Moving left, snap to right of platform
                return { x: platform.x + platform.width, collided: true };
            }
        }
        return { x: newX, collided: false };
    }
}
