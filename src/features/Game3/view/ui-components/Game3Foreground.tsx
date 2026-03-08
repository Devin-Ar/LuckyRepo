// src/features/Game3/view/ui-components/Game3Foreground.tsx
import React, { useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Container } from '@pixi/react';
import { Game3Presenter, ViewObject } from '../Game3Presenter';
import { GameSprite } from "../../../../components/GameSprite";

/**
 * Solid platform types that spikes can orient toward.
 * Floor(0), Wall(1), Fallthrough(6), Plat(7), NonWall(8), DisplayWall(9)
 */
const SOLID_TYPES = new Set([0, 1, 6, 7, 8, 9]);

/**
 * For a spike tile, determine how much to rotate it so the "pointy" side
 * faces toward an adjacent solid surface.
 * If no neighbor is found, defaults to 0 (points up).
 */
function getSpikeRotation(spike: ViewObject, objects: ViewObject[]): number {
    const tolerance = 0.15; // world-unit tolerance for adjacency checks
    const sx = spike.x;
    const sy = spike.y;
    const sw = spike.width;
    const sh = spike.height;

    let hasAbove = false;
    let hasBelow = false;

    for (const o of objects) {
        if (!SOLID_TYPES.has(o.type)) continue;

        // Horizontal overlap check (needed for above/below)
        const hOverlap = o.x + o.width > sx + tolerance && o.x < sx + sw - tolerance;

        // Check ABOVE: solid platform whose bottom edge touches spike's top edge
        if (hOverlap && Math.abs((o.y + o.height) - sy) < tolerance) {
            hasAbove = true;
        }
        // Check BELOW: solid platform whose top edge touches spike's bottom edge
        if (hOverlap && Math.abs(o.y - (sy + sh)) < tolerance) {
            hasBelow = true;
        }
    }

    // Ceiling spikes flip upside-down; floor spikes stay default (points up).
    if (hasAbove && !hasBelow) return Math.PI;        // flip upside down
    return 0;
}

export const Game3Foreground: React.FC<{
    vm: Game3Presenter;
    heroSprRef: React.RefObject<PIXI.Container>;
}> = ({ vm, heroSprRef }) => {
    const coinFrame = Math.floor(Date.now() / 250) % 2;
    const objects = vm.objects;

    // Pre-compute spike rotations once per render frame
    const spikeRotations = useMemo(() => {
        const map = new Map<number, number>();
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].type === 3) {
                map.set(i, getSpikeRotation(objects[i], objects));
            }
        }
        return map;
    }, [objects]);

    return (
        <Container name="foreground">
            {/* Level Environment Sprites */}
            {objects.map((p, i) => {
                const isCoin = p.type === 14;
                let assetName = "";
                if (!isCoin) {
                    switch(p.type) {
                        case 0: assetName = "Platform Floor"; break; //normal floor
                        case 1: assetName = "Platform Length"; break; //wall
                        //case 2: assetName = "Void Pit"; break;
                        case 3: assetName = "Spike Trap"; break;
                        case 4: assetName = "Portal Gate"; break;
                        case 5: assetName = "Exit Door"; break;
                        case 6: assetName = "Platform Floor"; break; // fallthrough floor
                        case 7: assetName = "Platform Floor"; break; //Another floor
                        case 8: assetName = "Platform NonWall"; break; // other wall
                        case 9: assetName = "Platform Floor BG"; break;
                        case 10: assetName = "Grass FG"; break;
                        case 11: assetName = "Grass BG"; break;
                        case 12: assetName = "NonOrganic FG"; break;
                        case 13: assetName = "NonOrganic BG"; break;
                    }
                }

                if (!assetName && !isCoin) return null;

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

                // Spike orientation: rotate the container around the tile center
                const isSpike = p.type === 3;
                const spikeRot = isSpike ? (spikeRotations.get(i) ?? 0) : 0;

                if (isSpike) {
                    // Position at tile center, rotate, then offset the sprite
                    // so anchor [0.5, 0.5] sits at the tile center
                    const cx = p.x + p.width / 2;
                    const cy = p.y + p.height / 2;

                    return (
                        <Container key={`sprite-${i}`} x={cx} y={cy} rotation={spikeRot}>
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