// src/features/Game3/view/ui-components/Game3Simulation.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Container, useApp, useTick } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';
import { Game3Background } from './Game3Background';
import { Game3Foreground } from './Game3Foreground';
import { Game3Hitboxes } from './Game3Hitboxes';

const PixiForceResizer: React.FC<{ w: number, h: number }> = ({ w, h }) => {
    const app = useApp();
    useEffect(() => {
        if (app?.renderer) {
            app.renderer.resize(w, h);
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
            PIXI.settings.ROUND_PIXELS = true;

            if (app.view instanceof HTMLCanvasElement) {
                app.view.width = w;
                app.view.height = h;
                app.view.style.imageRendering = 'pixelated';
            }
        }
    }, [app, w, h]);
    return null;
};

export const Game3Simulation: React.FC<{
    vm: Game3Presenter;
    width: number;
    height: number;
}> = ({ vm, width, height }) => {
    const worldContainerRef = useRef<PIXI.Container>(null);
    const heroRef = useRef<PIXI.Graphics>(null);
    const levelRef = useRef<PIXI.Graphics>(null);
    const heroSprRef = useRef<PIXI.Container>(null);

    const dynamicScale = height / 256;
    const renderScale = vm.worldScale * dynamicScale;

    useTick(() => {
        const hero = vm.heroVisuals;
        const world = worldContainerRef.current;
        const heroGfx = heroRef.current;
        const heroSpr = heroSprRef.current;

        if (!world || !hero || !heroGfx) return;

        heroGfx.x = hero.x;
        heroGfx.y = hero.y;

        const screenWidth = Math.round(hero.width * renderScale);
        const screenHeight = Math.round(hero.height * renderScale);

        const consistentWidth = screenWidth / renderScale;
        const consistentHeight = screenHeight / renderScale;

        heroGfx.clear();
        let color = 0x27ae60;
        if (hero.animState === 1) color = 0x2980b9;
        if (hero.animState === 2) color = 0xc0392b;

        heroGfx.beginFill(color, 1.0);
        heroGfx.drawRect(0, 0, consistentWidth, consistentHeight);
        heroGfx.endFill();

        const indW = (Math.round(hero.width * 0.3 * renderScale)) / renderScale;
        const indH = (Math.round(hero.height * 0.2 * renderScale)) / renderScale;
        const indX = hero.flipX ? 0 : consistentWidth - indW;

        heroGfx.beginFill(0xffffff, 0.5);
        heroGfx.drawRect(indX, consistentHeight * 0.1, indW, indH);
        heroGfx.endFill();

        if (heroSpr) {
            let sprX = hero.x + (hero.width / 2);
            let sprY = hero.y + hero.height;

            if (hero.animState === 3 || hero.animState === 4 || hero.animState === 5) {
                // Wall slide (3), cling (4), mantle (5)
                const wallDir = hero.wallDir || 0;

                // Nudge sprite toward the wall to close the gap from sprite padding
                // Use different nudge per state to avoid visual shift on transitions
                let nudge: number;
                if (hero.animState === 3) nudge = hero.width * 0.3;       // wall slide
                else if (hero.animState === 4) nudge = hero.width * 0.42; // cling
                else nudge = hero.width * 0.3;                            // mantle
                if (wallDir < 0) {
                    sprX = hero.x + (hero.width / 2) - nudge;
                } else if (wallDir > 0) {
                    sprX = hero.x + (hero.width / 2) + nudge;
                }

                // Cling: push sprite down so it hangs at ledge height
                if (hero.animState === 4) {
                    sprY += hero.height * 0.55;
                }

                // Mantle: push sprite down to align with ledge climb
                if (hero.animState === 5) {
                    sprY += hero.height * 0.65;
                }

                // Flip sprite to face the wall
                heroSpr.scale.x = wallDir > 0 ? 1 : -1;
            } else {
                heroSpr.scale.x = hero.flipX ? 1 : -1;
            }

            heroSpr.x = sprX;
            heroSpr.y = sprY;
        }

        const heroCenterX = (hero.x + hero.width / 2) * renderScale;
        const heroCenterY = (hero.y + hero.height / 2) * renderScale;

        world.x = (width / 2) - heroCenterX;
        world.y = (height / 2) - heroCenterY;
    });

    return (
        <>
            <PixiForceResizer w={width} h={height} />
            <Container ref={worldContainerRef} scale={renderScale}>
                <Game3Background />
                <Game3Foreground vm={vm} heroSprRef={heroSprRef} />
                <Game3Hitboxes vm={vm} levelRef={levelRef} heroRef={heroRef} />
            </Container>
        </>
    );
};