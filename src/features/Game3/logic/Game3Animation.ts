// src/features/Game3/logic/Game3Animation.ts
import { Game3Logic } from './Game3Logic';

export class Game3Animation {
    constructor(private logic: Game3Logic) {}

    public update() {
        if (this.logic.hero.vx > 0.01) this.logic.flipX = false;
        else if (this.logic.hero.vx < -0.01) this.logic.flipX = true;

        const prevState = this.logic.animState;
        if (this.logic.isWallSliding) this.logic.animState = 3;
        else if (!this.logic.isOnGround) this.logic.animState = 2;
        else if (Math.abs(this.logic.hero.vx) > 0.01) this.logic.animState = 1;
        else this.logic.animState = 0;

        if (prevState !== this.logic.animState) {
            this.logic.animFrame = 0;
            this.logic.animTimer = 0;
        }

        this.logic.animTimer++;
        if (this.logic.animTimer >= 6) {
            this.logic.animFrame = (this.logic.animFrame + 1) % 12;
            this.logic.animTimer = 0;
        }
    }
}
