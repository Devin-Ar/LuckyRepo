// src/features/Game3/logic/Game3ViewLogic.ts
import { Game3MainSchema, Game3PlatformsSchema } from '../model/Game3LogicSchema';
import { Game3ViewMainSchema, Game3ViewPlatformsSchema } from '../model/Game3ViewSchema';
import { BaseViewLogic } from '../../../core/templates/BaseViewLogic';

export class Game3ViewLogic extends BaseViewLogic {
    private uiBounce: number = 0;
    private glitchIntensity: number = 0;
    private lastHp: number = -1;

    // Animation internal state
    private animFrame = 0;
    private animTimer = 0;
    private lastAnimState = 0;
    private lastFlipX = false;

    public update(dt: number, frameCount: number) {
        const lMain = this.logicViews.get('main');
        const lPlatforms = this.logicViews.get('platforms');
        const vMain = this.outputViews.get('main');
        const vPlatforms = this.outputViews.get('platforms');

        if (!lMain || !lPlatforms || !vMain || !vPlatforms) return;

        // 1. Handle Output Resizing Request (Mirroring Game1 behavior)
        const objCount = lMain[Game3MainSchema.OBJ_COUNT];
        const vCapacity = Math.floor(vPlatforms.length / Game3ViewPlatformsSchema.STRIDE);

        if (objCount > vCapacity) {
            if ((this as any)._outResizePending !== vCapacity) {
                self.postMessage({
                    type: 'REQUEST_RESIZE_OUTPUT',
                    payload: {
                        bufferName: 'platforms',
                        newSize: (objCount + 1000) * Game3ViewPlatformsSchema.STRIDE
                    }
                });
                (this as any)._outResizePending = vCapacity;
            }
        } else {
            (this as any)._outResizePending = 0;
        }

        // 2. Read Basic State & Physics from Logic
        const hp = lMain[Game3MainSchema.HERO_HP];
        const vx = lMain[Game3MainSchema.HERO_VX];
        const isOnGround = lMain[Game3MainSchema.IS_ON_GROUND] === 1;
        const isWallSliding = lMain[Game3MainSchema.IS_WALL_SLIDING] === 1;

        // 3. Determine Animation State & Orientation (Moved from Logic)
        let flipX = this.lastFlipX;
        if (vx > 0.01) flipX = true;
        else if (vx < -0.01) flipX = false;
        this.lastFlipX = flipX;

        let animState = 0;
        if (isWallSliding) animState = 3;
        else if (!isOnGround) animState = 2;
        else if (Math.abs(vx) > 0.01) animState = 1;
        else animState = 0;

        // Process Animation Timer
        if (animState !== this.lastAnimState) {
            this.animFrame = 0;
            this.animTimer = 0;
            this.lastAnimState = animState;
        } else {
            this.animTimer++;
            if (this.animTimer >= 6) {
                this.animFrame = (this.animFrame + 1) % 12;
                this.animTimer = 0;
            }
        }

        // 4. Visual Effects (UI Bounce, etc)
        if (this.lastHp !== -1 && hp < this.lastHp) {
            this.glitchIntensity = 1.0;
        }
        this.lastHp = hp;
        this.glitchIntensity *= 0.92;

        const timeFactor = dt / 16.67;
        this.uiBounce += 0.05 * timeFactor;
        const vignettePulse = 0.5 + Math.sin(frameCount * 0.05) * 0.2;

        // 5. Write to View Buffer Main
        vMain[Game3ViewMainSchema.HERO_X] = lMain[Game3MainSchema.HERO_X];
        vMain[Game3ViewMainSchema.HERO_Y] = lMain[Game3MainSchema.HERO_Y];
        vMain[Game3ViewMainSchema.HERO_HP] = hp;

        vMain[Game3ViewMainSchema.HERO_ANIM_FRAME] = this.animFrame;
        vMain[Game3ViewMainSchema.HERO_FLIP] = flipX ? 1 : 0;
        vMain[Game3ViewMainSchema.HERO_ANIM_STATE] = animState;
        vMain[Game3ViewMainSchema.HERO_WIDTH] = lMain[Game3MainSchema.HERO_WIDTH];
        vMain[Game3ViewMainSchema.HERO_HEIGHT] = lMain[Game3MainSchema.HERO_HEIGHT];

        vMain[Game3ViewMainSchema.WORLD_SCALE] = lMain[Game3MainSchema.WORLD_SCALE];
        vMain[Game3ViewMainSchema.PLAYER_SCALE] = lMain[Game3MainSchema.PLAYER_SCALE];
        vMain[Game3ViewMainSchema.PLAYER_OFFSET_Y] = lMain[Game3MainSchema.PLAYER_OFFSET_Y];

        vMain[Game3ViewMainSchema.UI_BOUNCE] = Math.sin(this.uiBounce) * 5;
        vMain[Game3ViewMainSchema.GLITCH_INTENSITY] = this.glitchIntensity;
        vMain[Game3ViewMainSchema.VIGNETTE_PULSE] = vignettePulse;

        // 6. Sync Objects (Pass-through from Logic Platforms SAB to View Platforms SAB)
        const safeObjCount = Math.min(objCount, vCapacity);
        vMain[Game3ViewMainSchema.OBJ_COUNT] = safeObjCount;

        for (let i = 0; i < safeObjCount; i++) {
            const lBase = i * Game3PlatformsSchema.STRIDE;
            const vBase = i * Game3ViewPlatformsSchema.STRIDE;

            // x, y, width, height, type
            vPlatforms[vBase] = lPlatforms[lBase];
            vPlatforms[vBase + 1] = lPlatforms[lBase + 1];
            vPlatforms[vBase + 2] = lPlatforms[lBase + 2];
            vPlatforms[vBase + 3] = lPlatforms[lBase + 3];
            vPlatforms[vBase + 4] = lPlatforms[lBase + 4];
        }
    }

    public override getSnapshot() {
        return {
            uiBounce: this.uiBounce,
            glitchIntensity: this.glitchIntensity,
            lastHp: this.lastHp,
            animFrame: this.animFrame,
            animTimer: this.animTimer,
            lastAnimState: this.lastAnimState,
            lastFlipX: this.lastFlipX
        };
    }

    public override loadSnapshot(data: any) {
        if (data) {
            this.uiBounce = data.uiBounce ?? 0;
            this.glitchIntensity = data.glitchIntensity ?? 0;
            this.lastHp = data.lastHp ?? -1;
            this.animFrame = data.animFrame ?? 0;
            this.animTimer = data.animTimer ?? 0;
            this.lastAnimState = data.lastAnimState ?? 0;
            this.lastFlipX = data.lastFlipX ?? false;
        }
    }
}