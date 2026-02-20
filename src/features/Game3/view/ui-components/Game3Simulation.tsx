// src/features/Game3/view/ui-components/Game3Simulation.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics, useApp, useTick } from '@pixi/react';
import { Game3Presenter } from '../Game3Presenter';

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

    const dynamicScale = height / 256;
    const renderScale = vm.worldScale * dynamicScale;

    useEffect(() => {
        const g = levelRef.current;
        if (!g) return;

        g.clear();
        for (const p of vm.objects) {
            let color = 0x2c3e50;
            switch(p.type) {
                case 1: color = 0x8e44ad; break; // Wall
                case 2: color = 0x000000; break; // Void
                case 3: color = 0x1abc9c; break; // Spike
                case 4: color = 0x1c00ff; break; // Portal
                case 5: color = 0xff0000; break; // Exit
            }
            g.beginFill(color, 0.8);
            g.drawRect(p.x, p.y, p.width, p.height);
            g.endFill();
        }
    }, [vm.objects]);

    useTick(() => {
        const hero = vm.heroVisuals;
        const world = worldContainerRef.current;
        const heroGfx = heroRef.current;

        if (!world || !hero || !heroGfx) return;

        heroGfx.x = hero.x;
        heroGfx.y = hero.y;

        const screenWidth = Math.round(hero.width * renderScale);
        const screenHeight = Math.round(hero.height * renderScale);

        const consistentWidth = screenWidth / renderScale;
        const consistentHeight = screenHeight / renderScale;

        heroGfx.clear();
        let color = 0x27ae60;
        if (hero.animState === 1) color = 0x2980b9; // Dash/Special
        if (hero.animState === 2) color = 0xc0392b; // Hurt

        heroGfx.beginFill(color, 1.0);
        heroGfx.drawRect(0, 0, consistentWidth, consistentHeight);
        heroGfx.endFill();

        const indW = (Math.round(hero.width * 0.3 * renderScale)) / renderScale;
        const indH = (Math.round(hero.height * 0.2 * renderScale)) / renderScale;
        const indX = hero.flipX ? 0 : consistentWidth - indW;

        heroGfx.beginFill(0xffffff, 0.5);
        heroGfx.drawRect(indX, consistentHeight * 0.1, indW, indH);
        heroGfx.endFill();

        const heroCenterX = (hero.x + hero.width / 2) * renderScale;
        const heroCenterY = (hero.y + hero.height / 2) * renderScale;

        world.x = (width / 2) - heroCenterX;
        world.y = (height / 2) - heroCenterY;
    });

    return (
        <>
            <PixiForceResizer w={width} h={height} />
            <Container ref={worldContainerRef} scale={renderScale}>
                <Graphics ref={levelRef} />

                <Graphics ref={heroRef} />
            </Container>
        </>
    );
};