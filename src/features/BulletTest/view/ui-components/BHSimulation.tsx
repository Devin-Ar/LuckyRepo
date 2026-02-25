import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Container, useApp, useTick } from '@pixi/react';
import { BHPresenter } from '../BHPresenter';
import { BHBackground } from './BHBackground';
import { BHForeground } from './BHForeground';
import { BHHitboxes } from './BHHitboxes';

const PixiForceResizer: React.FC<{ w: number, h: number }> = ({ w, h }) => {
    const app = useApp();
    useEffect(() => {
        if (app?.renderer) {
            app.renderer.resize(w, h);
            if (app.view instanceof HTMLCanvasElement) {
                app.view.width = w; app.view.height = h;
            }
        }
    }, [app, w, h]);
    return null;
};

export const BHSimulation: React.FC<{
    vm: BHPresenter,
    paused: boolean,
    width: number,
    height: number,
    scale: number,
    heroPos: React.MutableRefObject<{ x: number, y: number }>,
    hp: number
}> = ({ vm, paused, width, height, scale, heroPos }) => {
    const worldRef = useRef<PIXI.Container>(null);
    const heroRef = useRef<PIXI.Container>(null);

    useTick(() => {
        if (!worldRef.current || !heroRef.current) return;

        const visuals = vm.heroVisuals;
        const mapW = vm.worldWidth;
        const mapH = vm.worldHeight;

        heroRef.current.x = visuals.x;
        heroRef.current.y = visuals.y;
        heroRef.current.scale.x = (visuals.mousePos >= 1.5 || visuals.mousePos <= -1.5) ? -1 : 1;

        heroPos.current.x = visuals.x;
        heroPos.current.y = visuals.y;

        const world = worldRef.current;

        let tx = (width / 2) - (visuals.x * scale);
        let ty = (height / 2) - (visuals.y * scale);

        const scaledMapW = mapW * scale;
        const scaledMapH = mapH * scale;

        if (scaledMapW > width) {
            tx = Math.min(0, Math.max(tx, width - scaledMapW));
        } else {
            tx = (width - scaledMapW) / 2;
        }

        if (scaledMapH > height) {
            ty = Math.min(0, Math.max(ty, height - scaledMapH));
        } else {
            ty = (height - scaledMapH) / 2;
        }

        world.x = tx;
        world.y = ty;
    });

    return (
        <>
            <PixiForceResizer w={width} h={height}/>
            <BHBackground paused={paused} w={width} h={height}/>
            <Container ref={worldRef} scale={scale}>
                <BHHitboxes vm={vm} paused={paused} />
                <BHForeground vm={vm} paused={paused} heroRef={heroRef} />
            </Container>
        </>
    );
};