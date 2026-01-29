
export enum HeroAnimationState {
    IDLE = 'IDLE',
    WALKING = 'WALKING',
    JUMPING = 'JUMPING'
}

export interface HeroAnimationUpdate {
    assetKey: string;
    frame: number;
    flipX: boolean;
}

export class HeroAssetManager {
    private static readonly ASSET_IDLE = 'hero_idle';
    private static readonly ASSET_WALKING = 'hero_walk';
    
    // Assuming frame counts from standard assets if not specified. 
    // Usually these are 4-8 frames. Let's assume some defaults.
    private static readonly FRAMES_IDLE = 12;
    private static readonly FRAMES_WALKING = 9;

    private currentState: HeroAnimationState = HeroAnimationState.IDLE;
    private currentFrame: number = 0;
    private flipX: boolean = false;
    private animationTick: number = 0;
    private readonly frameDelay: number = 10; // Change frame every 10 ticks

    public update(vx: number, vy: number, isOnGround: boolean): HeroAnimationUpdate {
        let newState = HeroAnimationState.IDLE;

        if (!isOnGround) {
            newState = HeroAnimationState.JUMPING;
        } else if (Math.abs(vx) > 0.1) {
            newState = HeroAnimationState.WALKING;
        }

        // Handle direction
        if (vx > 0.1) {
            this.flipX = false;
        } else if (vx < -0.1) {
            this.flipX = true;
        }

        // Handle state transition
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.currentFrame = 0;
            this.animationTick = 0;
        }

        // Update animation frame
        this.animationTick++;
        if (this.animationTick >= this.frameDelay) {
            this.animationTick = 0;
            this.currentFrame++;
        }

        let assetKey = HeroAssetManager.ASSET_IDLE;
        let frame = 0;

        switch (this.currentState) {
            case HeroAnimationState.IDLE:
                assetKey = HeroAssetManager.ASSET_IDLE;
                frame = this.currentFrame % HeroAssetManager.FRAMES_IDLE;
                break;
            case HeroAnimationState.WALKING:
                assetKey = HeroAssetManager.ASSET_WALKING;
                frame = this.currentFrame % HeroAssetManager.FRAMES_WALKING;
                break;
            case HeroAnimationState.JUMPING:
                // Use the last movement frame of the spritesheet applicable in the direction
                assetKey = HeroAssetManager.ASSET_WALKING;
                frame = HeroAssetManager.FRAMES_WALKING - 1;
                break;
        }

        return {
            assetKey,
            frame,
            flipX: this.flipX
        };
    }
}
