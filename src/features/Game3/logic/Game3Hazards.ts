// src/features/Game3/logic/Game3Hazards.ts
import { Game3Logic } from './Game3Logic';
import { Game3Collision } from './Game3Collision';

export class Game3Hazards {
    constructor(private logic: Game3Logic, private collision: Game3Collision) {}

    public updateSpikeLogic() {
        const currentlyInSpike = this.collision.checkHazardCollision('isSpike');
        if (currentlyInSpike) {
            if (!this.logic.inSpike || this.logic.spikeTimer <= 0) {
                this.logic.modifyHP(-10);
                this.logic.spikeTimer = 120;
            }
        }

        if (this.logic.spikeTimer > 0) {
            this.logic.spikeTimer--;
        }
        this.logic.inSpike = currentlyInSpike;
    }

    public updatePortalLogic() {
        if (this.logic.portalTimer > 0) {
            this.logic.portalTimer--;
            return;
        }

        const portal = this.collision.getCollidingPlatform('isPortal');
        if (portal) {
            const portals = this.logic.platformList.filter(p => p.isPortal);
            if (portals.length >= 2) {
                const otherPortal = portals.find(p => p !== portal);
                if (otherPortal) {
                    const { width, height } = this.logic.dimensions;
                    this.logic.heroState.x = otherPortal.x + (otherPortal.width / 2) - (width / 2);
                    this.logic.heroState.y = otherPortal.y + (otherPortal.height / 2) - (height / 2);
                    this.logic.portalTimer = 60;
                }
            }
        }
    }

    public updateVoidLogic() {
        if (this.collision.checkHazardCollision('isVoid')) {
            const hero = this.logic.heroState;
            const spawn = this.logic.spawn;
            hero.x = spawn.x;
            hero.y = spawn.y;
            hero.vx = 0;
            hero.vy = 0;
            this.logic.modifyHP(-20);
        }
    }

    public updateExitLogic() {
        if (!this.logic.levelCompleted && this.collision.checkHazardCollision('isExit')) {
            this.logic.levelCompleted = true;
            self.postMessage({ type: 'EVENT', name: 'LEVEL_COMPLETE' });
        }
    }
}