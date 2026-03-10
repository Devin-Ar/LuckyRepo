// src/features/Game3/view/ui-components/Game3Foreground.tsx
import React, { useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Container } from '@pixi/react';
import { Game3Presenter, ViewObject } from '../Game3Presenter';
import { GameSprite } from "../../../../components/GameSprite";

/**
 * Walkable platform types that spikes orient toward (floors the player stands on).
 * Floor(0), Fallthrough(6), Plat(7)
 */
const WALKABLE_TYPES = new Set([0, 6, 7]);

/**
 * Collidable wall types — walls the player can collide with.
 * Wall(1), NonWall(8)
 * DisplayWall(9) is purely visual so spikes should NOT orient toward it.
 */
const COLLIDABLE_WALL_TYPES = new Set([1, 8]);

/**
 * For a spike tile, determine rotation and offset from adjacent geometry.
 *
 * Priority logic (first match wins):
 *   1. Collidable wall to the LEFT  → π/2   (spike points RIGHT, away from wall)
 *   2. Collidable wall to the RIGHT → -π/2  (spike points LEFT,  away from wall)
 *   3. Walkable surface ABOVE       → π     (spike points DOWN from ceiling)
 *   4. Default                      → 0     (spike points UP from floor)
 *
 * Wall-adjacent spikes also get a small nudge away from the wall.
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

    for (const o of objects) {
        const isWalkable = WALKABLE_TYPES.has(o.type);
        const isCollidableWall = COLLIDABLE_WALL_TYPES.has(o.type);

        // Horizontal overlap (for above/below checks)
        const hOverlap = o.x + o.width > sx + tolerance && o.x < sx + sw - tolerance;
        // Vertical overlap (for left/right checks)
        const vOverlap = o.y + o.height > sy + tolerance && o.y < sy + sh - tolerance;

        if (isWalkable && hOverlap) {
            if (Math.abs((o.y + o.height) - sy) < tolerance) hasWalkableAbove = true;
            if (Math.abs(o.y - (sy + sh)) < tolerance) hasWalkableBelow = true;
        }

        if (isCollidableWall && vOverlap) {
            if (Math.abs((o.x + o.width) - sx) < tolerance) hasCollidableWallLeft = true;
            if (Math.abs(o.x - (sx + sw)) < tolerance) hasCollidableWallRight = true;
        }
    }

    // Determine rotation — wall-mounted spikes take priority over floor/ceiling
    let rotation = 0;
    let offsetX = 0;
    let offsetY = 0;

    const WALL_NUDGE = sw * 0.05;

// PRIORITY: floor / ceiling first
    if (hasWalkableAbove && !hasWalkableBelow) {
        // Ceiling spike
        rotation = Math.PI;
    }
    else if (hasWalkableBelow && !hasWalkableAbove) {
        // Floor spike
        rotation = 0;
    }
    else if (hasCollidableWallLeft && !hasCollidableWallRight) {
        // Wall on left → spike points right
        rotation = Math.PI / 2;
        offsetX = -WALL_NUDGE; // move closer to wall
    }
    else if (hasCollidableWallRight && !hasCollidableWallLeft) {
        // Wall on right → spike points left
        rotation = -Math.PI / 2;
        offsetX = WALL_NUDGE; // move closer to wall
    }
    else {
        rotation = 0;
    }

    return { rotation, offsetX, offsetY };
}

export const Game3Foreground: React.FC<{
    vm: Game3Presenter;
    heroSprRef: React.RefObject<PIXI.Container>;
}> = ({ vm, heroSprRef }) => {
    const coinFrame = Math.floor(Date.now() / 250) % 2;
    const voidFrame = Math.floor(Date.now() / 200) % 3;
    const portalFrame = Math.floor(Date.now() / 150) % 4;
    const objects = vm.objects;

    // Pre-compute spike layout (rotation + wall offset) once per render frame
    const spikeLayouts = useMemo(() => {
        const map = new Map<number, { rotation: number; offsetX: number; offsetY: number }>();
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].type === 3) {
                map.set(i, getSpikeLayout(objects[i], objects));
            }
        }
        return map;
    }, [objects]);

    return (
        <Container name="foreground">
            {/* Level Environment Sprites */}
            {objects.map((p, i) => {
                const isCoin = p.type === 14;
                const isVoid = p.type === 2;
                const isPortal = p.type === 4;
                let assetName = "";
                if (!isCoin && !isVoid && !isPortal) {
                    switch(p.type) {
                        case 0: assetName = "Platform Floor"; break; //normal floor
                        case 1: assetName = "Platform Length"; break; //wall
                        case 3: assetName = "Spike Trap"; break;
                        case 5: assetName = "Exit Door"; break;
                        case 6: assetName = "Platform FallThrough"; break; // fallthrough floor
                        case 7: assetName = "Platform Floor"; break; //Another floor
                        case 8: assetName = "Platform NonWall"; break; // other wall
                        case 9: assetName = "Platform Floor BG"; break;
                        case 10: assetName = "Grass FG"; break;
                        case 11: assetName = "Grass BG"; break;
                        case 12: assetName = "NonOrganic FG"; break;
                        case 13: assetName = "NonOrganic BG"; break;
                    }
                }

                if (!assetName && !isCoin && !isVoid && !isPortal) return null;

                if (!isCoin && p.type === 6 && p.width > p.height) {
                    const tileSize = p.height || 1;
                    const tileCount = Math.max(1, Math.round(p.width / tileSize));
                    const tiles = Array.from({ length: tileCount }, (_, idx) => (
                        <Container
                            key={`sprite-${i}-${idx}`}
                            x={p.x + (idx * tileSize) + (tileSize / 2)}
                            y={p.y + p.height}
                        >
                            <GameSprite
                                imageName={assetName}
                                anchor={[0.5, 1.0]}
                                scale={1/32}
                            />
                        </Container>
                    ));

                    return <React.Fragment key={`sprite-${i}`}>{tiles}</React.Fragment>;
                }

                // Spike orientation: rotate around tile center, offset away from walls
                const isSpike = p.type === 3;
                const layout = isSpike ? spikeLayouts.get(i) : null;

                if (isSpike && layout) {
                    const cx = p.x + p.width / 2 + layout.offsetX;
                    const cy = p.y + p.height / 2 + layout.offsetY;

                    return (
                        <Container key={`sprite-${i}`} x={cx} y={cy} rotation={layout.rotation}>
                            <GameSprite
                                imageName={assetName}
                                anchor={[0.5, 0.5]}
                                scale={p.width / 20}
                            />
                        </Container>
                    );
                }

                return (
                    <Container key={`sprite-${i}`} x={p.x + p.width / 2} y={p.y + p.height}>
                        {isCoin ? (
                            <GameSprite
                                sheetName="coin"
                                animationName="spin"
                                currentFrame={coinFrame}
                                anchor={[0.5, 1.0]}
                                scale={1/32}
                            />
                        ) : isVoid ? (
                            <GameSprite
                                sheetName="void_pit"
                                animationName="swirl"
                                currentFrame={voidFrame}
                                anchor={[0.5, 1.0]}
                                scale={1/20}
                            />
                        ) : isPortal ? (
                            <GameSprite
                                sheetName="plat_portal"
                                animationName="pulse"
                                currentFrame={portalFrame}
                                anchor={[0.5, 1.0]}
                                scale={p.width / 182 * 1.5}
                            />
                        ) : (
                            <GameSprite
                                imageName={assetName}
                                anchor={[0.5, 1.0]}
                                scale={1/32}
                            />
                        )}
                    </Container>
                );
            })}

            {/* Hero Animated Sprite */}
            <Container ref={heroSprRef}>
                <GameSprite
                    sheetName={vm.heroVisuals?.assetKey || "hero_body"}
                    animationName={vm.heroVisuals?.animationName || "idle"}
                    currentFrame={vm.heroVisuals?.frame || 0}
                    anchor={[0.5, 1.0]}
                    scale={1/16}
                />
            </Container>
        </Container>
    );
};