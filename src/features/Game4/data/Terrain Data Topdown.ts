// src/features/Game1/data/Terrain Data Topdown.ts

export interface Wall {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class TerrainDataTopdown {
    private walls: Wall[] = [];

    constructor(walls: Wall[] = []) {
        this.walls = walls;
    }

    public addWall(wall: Wall): void {
        this.walls.push(wall);
    }

    public getWalls(): Wall[] {
        return this.walls;
    }

    /**
     * Checks if a rectangle collides with any walls.
     * @returns true if there is a collision, false otherwise.
     */
    public checkCollision(x: number, y: number, width: number, height: number): boolean {
        for (const wall of this.walls) {
            if (
                x < wall.x + wall.width &&
                x + width > wall.x &&
                y < wall.y + wall.height &&
                y + height > wall.y
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolves movement with wall collisions.
     * Returns the adjusted position.
     */
    public resolveMovement(oldX: number, oldY: number, newX: number, newY: number, width: number, height: number): { x: number, y: number } {
        let finalX = newX;
        let finalY = newY;

        // Try moving horizontally
        if (this.checkCollision(newX, oldY, width, height)) {
            // Collision on X axis
            finalX = oldX;
        }

        // Try moving vertically from the (possibly adjusted) X position
        if (this.checkCollision(finalX, newY, width, height)) {
            // Collision on Y axis
            finalY = oldY;
        }

        return { x: finalX, y: finalY };
    }
}
