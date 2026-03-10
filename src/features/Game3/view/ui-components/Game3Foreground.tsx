// src/features/Game3/view/ui-components/Game3Foreground.tsx
import React, {MutableRefObject, useRef} from 'react';
import * as PIXI from 'pixi.js';
import {Container, useTick} from '@pixi/react';
import { Game3Presenter, ViewObject } from '../Game3Presenter';
import {SpriteManager} from "../../../../core/managers/SpriteManager";

/**
 * Walkable platform types that spikes orient toward (floors the player stands on).
 * Floor(0), Fallthrough(6), Plat(7)
 */
const WALKABLE_TYPES = new Set([0, 6, 7]);

/**
 * Collidable wall types that spikes can attach to sideways.
 * Wall(1), NonWallJumpable(8) — but NOT DisplayWall(9) since it has no collision.
 */
const COLLIDABLE_WALL_TYPES = new Set([1, 8]);

/**
 * All wall types — used for visual nudge when spike is floor/ceiling oriented.
 * Wall(1), NonWall(8), DisplayWall(9)
 */
const WALL_TYPES = new Set([1, 8, 9]);

/**
 * For a spike tile, determine rotation and offset from adjacent surfaces.
 *
 * Priority logic:
 *   1. Walkable below → 0 (points UP from floor, default)
 *   2. Walkable above → π (points DOWN from ceiling)
 *   3. Collidable wall to left → π/2 (points RIGHT from left wall)
 *   4. Collidable wall to right → -π/2 (points LEFT from right wall)
 *   5. Fallback → 0
 *
 * When floor/ceiling oriented, nudge sprite away from adjacent walls.
 */
function getSpikeLayout(spike: ViewObject, objects: ViewObject[]): { rotation: number; offsetX: number; offsetY: number } {
    const tolerance = 0.15;
    const sx = spike.x;
    const sy = spike.y;
    const sw = spike.width;
    const sh = spike.height;

    let hasWalkableAbove = false;
    let hasWalkableBelow = false;
    let hasCollidableWallLeft = false;
    let hasCollidableWallRight = false;
    let hasAnyWallLeft = false;
    let hasAnyWallRight = false;

    for (const o of objects) {
        const isWalkable = WALKABLE_TYPES.has(o.type);
        const isCollidableWall = COLLIDABLE_WALL_TYPES.has(o.type);
        const isAnyWall = WALL_TYPES.has(o.type);

        // Horizontal overlap (for above/below checks)
        const hOverlap = o.x + o.width > sx + tolerance && o.x < sx + sw - tolerance;
        // Vertical overlap (for left/right checks)
        const vOverlap = o.y + o.height > sy + tolerance && o.y < sy + sh - tolerance;

        if (isWalkable && hOverlap) {
            if (Math.abs((o.y + o.height) - sy) < tolerance) hasWalkableAbove = true;
            if (Math.abs(o.y - (sy + sh)) < tolerance) hasWalkableBelow = true;
        }

        if (vOverlap) {
            if (isCollidableWall) {
                if (Math.abs((o.x + o.width) - sx) < tolerance) hasCollidableWallLeft = true;
                if (Math.abs(o.x - (sx + sw)) < tolerance) hasCollidableWallRight = true;
            }
            if (isAnyWall) {
                if (Math.abs((o.x + o.width) - sx) < tolerance) hasAnyWallLeft = true;
                if (Math.abs(o.x - (sx + sw)) < tolerance) hasAnyWallRight = true;
            }
        }
    }

    // Determine orientation: floor/ceiling takes priority over wall attachment
    if (hasWalkableBelow) {
        // Points UP from floor (default)
        const WALL_NUDGE = sw * 0.15;
        let offsetX = 0;
        if (hasAnyWallLeft && !hasAnyWallRight) offsetX = WALL_NUDGE;
        else if (hasAnyWallRight && !hasAnyWallLeft) offsetX = -WALL_NUDGE;
        return { rotation: 0, offsetX, offsetY: 0 };
    }

    if (hasWalkableAbove) {
        // Points DOWN from ceiling
        const WALL_NUDGE = sw * 0.15;
        let offsetX = 0;
        if (hasAnyWallLeft && !hasAnyWallRight) offsetX = WALL_NUDGE;
        else if (hasAnyWallRight && !hasAnyWallLeft) offsetX = -WALL_NUDGE;
        return { rotation: Math.PI, offsetX, offsetY: 0 };
    }

    // No walkable above or below — check for sideways wall attachment
    if (hasCollidableWallLeft && !hasCollidableWallRight) {
        // Wall to the left → spike points RIGHT (away from wall)
        return { rotation: Math.PI / 2, offsetX: 0, offsetY: 0 };
    }

    if (hasCollidableWallRight && !hasCollidableWallLeft) {
        // Wall to the right → spike points LEFT (away from wall)
        return { rotation: -Math.PI / 2, offsetX: 0, offsetY: 0 };
    }

    // Fallback: default upward
    return { rotation: 0, offsetX: 0, offsetY: 0 };
}

const ForegroundAnimated: React.FC<{
    vm: Game3Presenter;
    heroSprRef: React.RefObject<PIXI.Container>;
}> = ({ vm, heroSprRef }) => {
    const containerRef = useRef<PIXI.Container>(null);
    const manager = SpriteManager.getInstance();

    // Separate pools for each animated type
    const coinPool = useRef<PIXI.AnimatedSprite[]>([]);
    const voidPool = useRef<PIXI.AnimatedSprite[]>([]);
    const portalPool = useRef<PIXI.AnimatedSprite[]>([]);
    const heroSprite = useRef<PIXI.AnimatedSprite | null>(null);
    const tickRef = useRef(0);

    useTick(() => {
        if (!containerRef.current) return;
        tickRef.current++;

        const coinFrame = Math.floor(tickRef.current / 15) % 2;
        const voidFrame = Math.floor(tickRef.current / 10) % 3;
        const portalFrame = Math.floor(tickRef.current / 8) % 4;

        const objects = vm.objects;

        // Gather objects by type
        const coins = objects.filter(p => p.type === 14);
        const voids = objects.filter(p => p.type === 2);
        const portals = objects.filter(p => p.type === 4);

        // --- Coin pool ---
        while (coinPool.current.length < coins.length) {
            const textures = manager.getAnimation('coin_spin');
            const sprite = new PIXI.AnimatedSprite(textures);
            sprite.anchor.set(0.5, 1.0);
            sprite.scale.set(1/32);
            containerRef.current.addChild(sprite);
            coinPool.current.push(sprite);
        }
        while (coinPool.current.length > coins.length) {
            const sprite = coinPool.current.pop();
            if (sprite) { containerRef.current.removeChild(sprite); sprite.destroy(); }
        }
        for (let i = 0; i < coins.length; i++) {
            const sprite = coinPool.current[i];
            const p = coins[i];
            sprite.visible = true;
            sprite.x = p.x + p.width / 2;
            sprite.y = p.y + p.height;
            sprite.gotoAndStop(coinFrame % sprite.textures.length);
        }

        // --- Void pool ---
        while (voidPool.current.length < voids.length) {
            const textures = manager.getAnimation('void_pit_swirl');
            const sprite = new PIXI.AnimatedSprite(textures);
            sprite.anchor.set(0.5, 1.0);
            sprite.scale.set(1/20);
            containerRef.current.addChild(sprite);
            voidPool.current.push(sprite);
        }
        while (voidPool.current.length > voids.length) {
            const sprite = voidPool.current.pop();
            if (sprite) { containerRef.current.removeChild(sprite); sprite.destroy(); }
        }
        for (let i = 0; i < voids.length; i++) {
            const sprite = voidPool.current[i];
            const p = voids[i];
            sprite.visible = true;
            sprite.x = p.x + p.width / 2;
            sprite.y = p.y + p.height;
            sprite.gotoAndStop(voidFrame % sprite.textures.length);
        }

        // --- Portal pool ---
        while (portalPool.current.length < portals.length) {
            const textures = manager.getAnimation('plat_portal_pulse');
            const sprite = new PIXI.AnimatedSprite(textures);
            sprite.anchor.set(0.5, 1.0);
            containerRef.current.addChild(sprite);
            portalPool.current.push(sprite);
        }
        while (portalPool.current.length > portals.length) {
            const sprite = portalPool.current.pop();
            if (sprite) { containerRef.current.removeChild(sprite); sprite.destroy(); }
        }
        for (let i = 0; i < portals.length; i++) {
            const sprite = portalPool.current[i];
            const p = portals[i];
            sprite.visible = true;
            sprite.x = p.x + p.width / 2;
            sprite.y = p.y + p.height;
            sprite.scale.set(p.width / 182 * 1.5);
            sprite.gotoAndStop(portalFrame % sprite.textures.length);
        }

        // --- Hero sprite ---
        const visuals = vm.heroVisuals;
        if (visuals && heroSprRef.current) {
            if (!heroSprite.current) {
                const textures = manager.getAnimation(`${visuals.assetKey}_${visuals.animationName}`);
                heroSprite.current = new PIXI.AnimatedSprite(textures);
                heroSprite.current.anchor.set(0.5, 1.0);
                heroSprite.current.scale.set(1/16);
                heroSprRef.current.addChild(heroSprite.current);
            }
            const sprite = heroSprite.current;
            const textures = manager.getAnimation(`${visuals.assetKey}_${visuals.animationName}`);
            if (sprite.textures !== textures) sprite.textures = textures;
            sprite.gotoAndStop(Math.floor(visuals.frame) % sprite.textures.length);
        }
    });

    return (
        <>
            <Container ref={containerRef} name="foreground_animated" />
            <Container ref={heroSprRef} name="hero_container" />
        </>
    );
};

const ForegroundStatic: React.FC<{
    vm: Game3Presenter;
}> = ({ vm }) => {
    const containerRef = useRef<PIXI.Container>(null);
    const manager = SpriteManager.getInstance();
    const built = useRef(false);
    const working : MutableRefObject<boolean[]> = useRef([]);

    useTick(() => {
        if (!containerRef.current || built.current) return;
        if (working.current.length != 0) {
            let loadflag = true;
            working.current.forEach((val, indx) => {
                if (!val) {
                    loadflag = false;
                }
            })
            if (loadflag && vm.objects.length <= working.current.length) {
                built.current = true;
            }
        }

        const objects = vm.objects;

        const spikeLayouts = new Map<number, { rotation: number; offsetX: number; offsetY: number }>();
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].type === 3) {
                spikeLayouts.set(i, getSpikeLayout(objects[i], objects));
            }
        }

        for (let i = 0; i < objects.length; i++) {
            const p = objects[i];
            if (p.type === 14 || p.type === 2 || p.type === 4) continue;

            let assetName = "";
            switch(p.type) {
                case 0: assetName = "Platform Floor"; break;
                case 1: assetName = "Platform Length"; break;
                case 3: assetName = "Spike Trap"; break;
                case 5: assetName = "Exit Door"; break;
                case 6: assetName = "FallThrough Platform"; break;
                case 7: assetName = "Platform Floor"; break;
                case 8: assetName = "Platform NonWall"; break;
                case 9: assetName = "Platform Floor BG"; break;
                case 10: assetName = "Grass FG"; break;
                case 11: assetName = "Grass BG"; break;
                case 12: assetName = "NonOrganic FG"; break;
                case 13: assetName = "NonOrganic BG"; break;
                default: continue;
            }

            const texture = manager.getTexture(assetName);
            if (!texture) continue;

            // Tiled floor
            if (p.type === 6 && p.width > p.height) {
                const tileSize = p.height || 1;
                const tileCount = Math.max(1, Math.round(p.width / tileSize));
                for (let idx = 0; idx < tileCount; idx++) {
                    const sprite = new PIXI.Sprite(texture);
                    sprite.anchor.set(0.5, 1.0);
                    sprite.scale.set(1/32);
                    sprite.x = p.x + (idx * tileSize) + (tileSize / 2);
                    sprite.y = p.y + p.height;
                    containerRef.current.addChild(sprite);
                }
                working.current[i] = true;
                continue;
            }

            // Spike
            if (p.type === 3) {
                const layout = spikeLayouts.get(i);
                if (!layout) {
                    working.current[i] = false;
                    continue;
                }
                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5, 0.5);
                sprite.scale.set(p.width / 20);
                sprite.x = p.x + p.width / 2 + layout.offsetX;
                sprite.y = p.y + p.height / 2 + layout.offsetY;
                sprite.rotation = layout.rotation;
                containerRef.current.addChild(sprite);
                working.current[i] = true;
                continue;
            }

            // Everything else
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor.set(0.5, 1.0);
            sprite.scale.set(1/32);
            sprite.x = p.x + p.width / 2;
            sprite.y = p.y + p.height;
            containerRef.current.addChild(sprite);
            working.current[i] = true;
        }
    }); // empty deps - build once on mount, never again

    return <Container ref={containerRef} name="foreground_static" />;
};

export const Game3Foreground: React.FC<{
    vm: Game3Presenter;
    heroSprRef: React.RefObject<PIXI.Container>;
}> = ({ vm, heroSprRef }) => {
    return (
        <Container name="foreground">
            <ForegroundStatic vm={vm} />
            <ForegroundAnimated vm={vm} heroSprRef={heroSprRef} />
        </Container>
    );
};//