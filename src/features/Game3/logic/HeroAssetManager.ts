// src/features/Game3/logic/HeroAssetManager.ts
export class HeroAssetManager {
    private frame = 0;
    private frameTimer = 0;
    private currentSheet = 'hero_idle';
    private flipX = false;

    public update(vx: number, vy: number, isOnGround: boolean) {
        const prevSheet = this.currentSheet;

        // 1. Determine Direction
        if (vx > 0.1) this.flipX = false;
        else if (vx < -0.1) this.flipX = true;

        // 2. Determine State
        if (!isOnGround) {
            this.currentSheet = 'hero_jump'; // Example key
        } else if (Math.abs(vx) > 0.1) {
            this.currentSheet = 'hero_walk';
        } else {
            this.currentSheet = 'hero_idle';
        }

        // 3. Handle Animation Ticking
        if (prevSheet !== this.currentSheet) {
            this.frame = 0;
            this.frameTimer = 0;
        }

        this.frameTimer++;
        if (this.frameTimer > 6) { // Every 6 logic ticks, advance frame
            this.frame = (this.frame + 1) % 4; // Assuming 4-frame animations
            this.frameTimer = 0;
        }

        return {
            assetKey: this.currentSheet,
            frame: this.frame,
            flipX: this.flipX
        };
    }
}