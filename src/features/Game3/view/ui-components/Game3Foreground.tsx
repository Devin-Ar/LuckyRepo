// src/features/Game3/view/ui-components/Game3Foreground.tsx
import React from 'react';
import * as PIXI from 'pixi.js';
import { Container } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';
import { GameSprite } from "../../../../components/GameSprite";

export const Game3Foreground: React.FC<{
    vm: Game3Presenter;
    heroSprRef: React.RefObject<PIXI.Container>;
}> = ({ vm, heroSprRef }) => {
    const coinFrame = Math.floor(Date.now() / 250) % 2;

    return (
        <Container name="foreground">
            {/* Level Environment Sprites */}
            {vm.objects.map((p, i) => {
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
                                scale={p.type === 3 ? p.width / 20 : 1/32}
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