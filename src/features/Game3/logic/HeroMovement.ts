// src/features/Game3/logic/HeroMovement.ts

export class HeroMovement {
    // Mario-esque movement parameters
    private maxSpeed = 4.5;
    private groundAcceleration = 0.6;
    private groundFriction = 0.5;
    private airAcceleration = 0.25;
    private airFriction = 0.05;
    private jumpForce = -11;
    private gravity = 0.6;

    /**
     * Configures the movement parameters.
     */
    public configure(params: { speed?: number, jumpSpeed?: number, gravity?: number }): void {
        if (params.speed !== undefined) this.maxSpeed = params.speed * 4; // Scale speed if needed, or use directly
        if (params.jumpSpeed !== undefined) this.jumpForce = -params.jumpSpeed;
        if (params.gravity !== undefined) this.gravity = params.gravity;
        
        // Adjust other params proportionally if needed
        this.groundAcceleration = this.maxSpeed * 0.13;
        this.groundFriction = this.groundAcceleration * 0.8;
        this.airAcceleration = this.groundAcceleration * 0.4;
        this.airFriction = this.groundFriction * 0.1;
    }

    /**
     * Updates the hero's velocity based on input and state.
     * @param hero The hero object containing vx and vy.
     * @param keys Currently pressed keys.
     * @param isOnGround Whether the hero is currently on the ground.
     */
    public update(
        hero: { vx: number; vy: number },
        keys: string[],
        isOnGround: boolean
    ): void {
        // --- Horizontal Movement ---
        let moveDir = 0;
        if (keys.includes('A') || keys.includes('ARROWLEFT')) moveDir -= 1;
        if (keys.includes('D') || keys.includes('ARROWRIGHT')) moveDir += 1;

        const acceleration = isOnGround ? this.groundAcceleration : this.airAcceleration;
        const friction = isOnGround ? this.groundFriction : (moveDir === 0 ? this.maxSpeed * 0.1 : this.airFriction);

        if (moveDir !== 0) {
            // Apply acceleration
            hero.vx += moveDir * acceleration;
            // Clamp to max speed
            if (Math.abs(hero.vx) > this.maxSpeed) {
                hero.vx = Math.sign(hero.vx) * this.maxSpeed;
            }
        } else {
            // No input: apply friction/braking
            if (Math.abs(hero.vx) < friction) {
                hero.vx = 0;
            } else {
                hero.vx -= Math.sign(hero.vx) * friction;
            }
        }

        // --- Vertical Movement ---
        // Apply gravity
        hero.vy += this.gravity;

        // Jump logic
        // We check for Space, W, and ArrowUp as requested (with Space specifically highlighted)
        const wantsToJump = keys.includes(' ') || keys.includes('W') || keys.includes('ARROWUP');
        if (isOnGround && wantsToJump) {
            hero.vy = this.jumpForce;
        }
    }
}
