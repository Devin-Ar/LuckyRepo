// src/features/Game3/logic/HeroMovement.ts
export class HeroMovement {
    private speed = 4.5;       // Increased for 1:1 pixel logic
    private jumpPower = -9.0;  // More "oomph" for 32x64 hero
    private gravity = 0.45;    // Snappier gravity
    private friction = 0.8;

    public configure(params: { speed?: number; jumpSpeed?: number; gravity?: number }) {
        if (params.speed) this.speed = params.speed;
        if (params.jumpSpeed) this.jumpPower = -Math.abs(params.jumpSpeed);
        if (params.gravity) this.gravity = params.gravity;
    }

    /**
     * @param keys Expects uppercase strings (e.g., 'A', 'ARROWLEFT')
     */
    public update(hero: { vx: number; vy: number }, keys: string[], isOnGround: boolean) {
        if (!keys) return;

        // 1. Horizontal Movement
        let moveDir = 0;

        // Check for both standardized uppercase and common fallbacks
        if (keys.includes('A') || keys.includes('ARROWLEFT')) moveDir -= 1;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) moveDir += 1;

        if (moveDir !== 0) {
            hero.vx = moveDir * this.speed;
        } else {
            // Apply friction when no keys are pressed
            hero.vx *= this.friction;
            if (Math.abs(hero.vx) < 0.1) hero.vx = 0;
        }

        // 2. Vertical Movement (Gravity)
        // Only apply gravity if we aren't "locked" to a floor (handled by resolution)
        hero.vy += this.gravity;

        // 3. Jump Logic
        const isJumping = keys.includes(' ') || keys.includes('W') || keys.includes('ARROWUP');

        if (isOnGround && isJumping) {
            hero.vy = this.jumpPower;
        }

        // 4. Terminal Velocity (Prevents falling through floors at high speed)
        if (hero.vy > 12) hero.vy = 12;
    }
}