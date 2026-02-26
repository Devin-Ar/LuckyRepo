// src/features/Cinematic/CinematicView.ts
import React, { useState, useEffect, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Stage, useApp } from '@pixi/react';
import { GameSprite } from '../../components/GameSprite';
import { CinematicController } from './CinematicController';
import { SpriteManager } from '../../core/managers/SpriteManager';

// NTS: Make this a component 'cause it is identical everywhere
const CinematicForceResizer: React.FC<{ w: number, h: number }> = ({ w, h }) => {
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

interface CinematicViewProps {
    controller: CinematicController;
    imageName: string;
    width?: number;
    height?: number;
}

export const CinematicView: React.FC<CinematicViewProps> = ({
                                                                controller, imageName, width = 960, height = 540
                                                            }) => {
    const [alpha, setAlpha] = useState(0);

    useEffect(() => {
        controller.bind(setAlpha);
        controller.startSequence(800, 2500, 800);
        }, [controller]);

    const stageOptions = useMemo(() => ({
        backgroundColor: 0x000000,
        antialias: false,
        resolution: 1,
        autoDensity: false
    }), []);

    const stageStyle = useMemo(() => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        imageRendering: 'pixelated'
    } as React.CSSProperties), []);

    const imageScale = useMemo(() => {
        const texture = SpriteManager.getInstance().getTexture(imageName);
        return texture && texture.width > 1 ? width / texture.width : width / 640;
    }, [imageName, width]);

    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
            <div style={{
                position: 'relative',
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                background: '#000',
                overflow: 'hidden'
            }}>
                <Stage
                    width={width}
                    height={height}
                    options={stageOptions}
                    style={stageStyle}
                >
                    <CinematicForceResizer w={width} h={height} />
                    <GameSprite
                        imageName={imageName}
                        x={width / 2}
                        y={height / 2}
                        anchor={0.5}
                        alpha={alpha}
                        scale={imageScale}
                    />
                </Stage>
            </div>
        </div>
    );
};