// src/features/Game3/data/TerrainDataPlatformer.ts
import { PlatformData } from './Game3MapData';

export class TerrainDataPlatformer {
    private platforms: PlatformData[] = [];

    constructor(platforms: PlatformData[] = []) {
        this.platforms = platforms;
    }

    public isOnPlatform(x: number, y: number, width: number, height: number): boolean {
        // Check slightly below the hero's feet (1 pixel down)
        const checkY = y + height + 1;
        for (const p of this.platforms) {
            if (
                x + width > p.x &&
                x < p.x + p.width &&
                checkY > p.y &&
                y + height <= p.y // Was above or at the platform level
            ) {
                return true;
            }
        }
        return false;
    }

    public resolveHorizontalMovement(oldX: number, newX: number, y: number, width: number, height: number) {
        for (const p of this.platforms) {
            // Check if hero rectangle at newX overlaps platform p
            if (newX + width > p.x && newX < p.x + p.width && y + height > p.y && y < p.y + p.height) {
                // Collision! Snap to the edge of the platform
                if (newX > oldX) return { x: p.x - width, collided: true }; // Hit left side
                if (newX < oldX) return { x: p.x + p.width, collided: true }; // Hit right side
            }
        }
        return { x: newX, collided: false };
    }

    public resolveVerticalMovement(x: number, oldY: number, newY: number, width: number, height: number) {
        for (const p of this.platforms) {
            if (x + width > p.x && x < p.x + p.width && newY + height > p.y && newY < p.y + p.height) {
                // Collision!
                if (newY > oldY) return { y: p.y - height, collided: true }; // Hit top (Land)
                if (newY < oldY) return { y: p.y + p.height, collided: true }; // Hit bottom (Ceiling)
            }
        }
        return { y: newY, collided: false };
    }
}