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
    return (
        <Container name="foreground">
            {/* Level Environment Sprites */}
            {vm.objects.map((p, i) => {
                let assetName = "";
                switch(p.type) {
                    case 0: assetName = "Platform Floor"; break;
                    case 1: assetName = "Platform Length"; break;
                    case 2: assetName = "Void Pit"; break;
                    case 3: assetName = "Spike Trap"; break;
                    case 4: assetName = "Portal Gate"; break;
                    case 5: assetName = "Exit Door"; break;
                    case 6: assetName = "Platform Floor"; break;
                }

                if (!assetName) return null;

                return (
                    <Container key={`sprite-${i}`} x={p.x + p.width / 2} y={p.y + p.height}>
                        <GameSprite
                            imageName={assetName}
                            anchor={[0.5, 1.0]}
                            scale={1/32}
                        />
                    </Container>
                );
            })}

            {/* Hero Animated Sprite */}
            <Container ref={heroSprRef}>
                <GameSprite
                    sheetName={vm.heroVisuals?.assetKey || "hero_idle"}
                    animationName={vm.heroVisuals?.animationName || "idle"}
                    currentFrame={vm.heroVisuals?.frame || 0}
                    anchor={[0.5, 1.0]}
                    scale={1/32}
                />
            </Container>
        </Container>
    );
};