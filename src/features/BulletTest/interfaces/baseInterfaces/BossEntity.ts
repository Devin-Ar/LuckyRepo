// src/features/BulletTest/interfaces/baseInterfaces/BossEntity.ts
import { baseEntity } from "./baseEntity";
import { IBossEnemy } from "../IEnemy";
import { basePlayer } from "./basePlayer";
import { enemyProjectile } from "./baseProjectile";
import { BHConfig } from "../../model/BHConfig";

export class BossEntity extends baseEntity implements IBossEnemy {
    public vulnerable: boolean = false;
    public phase: number = 1;

    // Shooting
    private lastShotFrame: number = 0;
    private readonly phase1FireRate: number = 25;
    private readonly phase2FireRate: number = 60;
    private readonly phase2RingCount: number = 8;
    private readonly phase3FireRate: number = 50;
    private readonly phase3InnerCount: number = 8;
    private readonly phase3OuterCount: number = 12;

    // Bouncing (phase 3)
    private bounceVx: number = 0;
    private bounceVy: number = 0;
    private readonly bounceSpeed: number = 1.5;
    private bouncing: boolean = false;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 200;
        this.health = 300;
        this.active = true;
        this.type = "boss";
    }

    update(player: basePlayer, config: BHConfig): void {
        // Contact damage — always active while boss is alive
        if (this.active) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const dx = cx - player.x;
            const dy = cy - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = this.width / 2;

            if (dist < radius + player.width / 2) {
                player.modifyHp(-0.5);
                self.postMessage({ type: 'EVENT', name: 'EXPLOSION_REQ' });
            }
        }

        // Bouncing — only phase 3
        if (this.phase < 3) return;

        if (!this.bouncing) {
            this.bouncing = true;
            const angle = Math.random() * Math.PI * 2;
            this.bounceVx = Math.cos(angle) * this.bounceSpeed;
            this.bounceVy = Math.sin(angle) * this.bounceSpeed;
        }

        this.x += this.bounceVx;
        this.y += this.bounceVy;

        if (this.x <= 0) { this.x = 0; this.bounceVx *= -1; }
        if (this.x + this.width >= config.width) { this.x = config.width - this.width; this.bounceVx *= -1; }
        if (this.y <= 0) { this.y = 0; this.bounceVy *= -1; }
        if (this.y + this.height >= config.height) { this.y = config.height - this.height; this.bounceVy *= -1; }
    }

    updateAttacks(player: basePlayer, frameCount: number, enemyProjectiles: enemyProjectile[]): void {
        if (!this.active || !this.vulnerable) return;

        const fireRate = this.phase === 1 ? this.phase1FireRate
            : this.phase === 2 ? this.phase2FireRate
                : this.phase3FireRate;

        if (frameCount - this.lastShotFrame < fireRate) return;
        this.lastShotFrame = frameCount;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this.phase === 1) {
            enemyProjectiles.push(new enemyProjectile(cx, cy, player.x, player.y));
        } else if (this.phase === 2) {
            this.fireRing(cx, cy, this.phase2RingCount, 0, 8, player.x, player.y, enemyProjectiles);
        } else {
            this.fireRing(cx, cy, this.phase3InnerCount, 0, 8, player.x, player.y, enemyProjectiles);
            const offsetAngle = Math.PI / this.phase3OuterCount;
            this.fireRing(cx, cy, this.phase3OuterCount, offsetAngle, 5, player.x, player.y, enemyProjectiles);
        }
    }

    private fireRing(
        cx: number, cy: number,
        count: number, angleOffset: number, speed: number,
        playerX: number, playerY: number,
        enemyProjectiles: enemyProjectile[]
    ): void {
        const baseAngle = Math.atan2(playerY - cy, playerX - cx);
        const angleStep = (Math.PI * 2) / count;
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + angleStep * i + angleOffset;
            const targetX = cx + Math.cos(angle) * 1000;
            const targetY = cy + Math.sin(angle) * 1000;
            const proj = new enemyProjectile(cx, cy, targetX, targetY);
            proj.vx = Math.cos(angle) * speed;
            proj.vy = Math.sin(angle) * speed;
            enemyProjectiles.push(proj);
        }
    }

    orientation(player: basePlayer): void {
        const dx = this.x + this.width / 2 - player.x;
        const dy = this.y + this.height / 2 - player.y;
        this.playerRelative = Math.atan2(dy, dx);
    }

    syncToSAB(sharedView: Float32Array, base: number): void {
        sharedView[base] = this.x;
        sharedView[base + 1] = this.y;
        sharedView[base + 2] = this.seed;
        sharedView[base + 3] = this.vulnerable ? 1 : 0;
        sharedView[base + 4] = this.health;
    }

    modifyHP(points: number) {
        if (this.active && this.vulnerable) {
            this.health += points;
        }
        if (this.health <= 0) {
            this.active = false;
        }
    }
}