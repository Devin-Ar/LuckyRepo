// src/features/Game3/logic/Game3Hazards.ts
import { Game3Logic } from './Game3Logic';
import { Game3Collision } from './Game3Collision';
import { PlatformData } from '../data/Game3MapData';

export class Game3Hazards {
    constructor(private logic: Game3Logic, private collision: Game3Collision) {}

    public updateSpikeLogic() {
        const currentlyInSpike = this.collision.checkHazardCollision('isSpike');
        if (currentlyInSpike) {
            if (!this.logic.wasInSpike || this.logic.spikeDamageTimer <= 0) {
                this.logic.modifyHP(-10);
                this.logic.spikeDamageTimer = 120;
            }
        }

        if (this.logic.spikeDamageTimer > 0) {
            this.logic.spikeDamageTimer--;
        }
        this.logic.wasInSpike = currentlyInSpike;
    }

    public updatePortalLogic() {
        if (this.logic.portalCooldown > 0) {
            this.logic.portalCooldown--;
            return;
        }

        const portal = this.collision.getCollidingPlatform('isPortal');
        if (portal) {
            const portals = this.logic.platforms.filter(p => p.isPortal);
            if (portals.length >= 2) {
                const otherPortal = portals.find(p => p !== portal);
                if (otherPortal) {
                    this.logic.hero.x = otherPortal.x + (otherPortal.width / 2) - (this.logic.heroWidth / 2);
                    this.logic.hero.y = otherPortal.y + (otherPortal.height / 2) - (this.logic.heroHeight / 2);
                    this.logic.portalCooldown = 60;
                }
            }
        }
    }

    public updateVoidLogic() {
        if (this.collision.checkHazardCollision('isVoid')) {
            this.logic.hero.x = this.logic.spawnPoint.x;
            this.logic.hero.y = this.logic.spawnPoint.y;
            this.logic.hero.vx = 0;
            this.logic.hero.vy = 0;
            this.logic.modifyHP(-20);
        }
    }

    public updateExitLogic() {
        if (!this.logic.hasCompletedLevel && this.collision.checkHazardCollision('isExit')) {
            this.logic.hasCompletedLevel = true;
            // Send event to main thread so the controller can handle progression
            self.postMessage({ type: 'EVENT', name: 'LEVEL_COMPLETE' });
        }
    }
}
