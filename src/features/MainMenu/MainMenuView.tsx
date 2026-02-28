// src/features/MainMenu/MainMenuView.tsx
import React, { useState, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { Stage, useApp, useTick } from '@pixi/react';
import { MainMenuController } from './MainMenuController';
import { GameSprite } from '../../components/GameSprite';

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

const MenuAnimatedSprite: React.FC<{ animationName: string }> = () => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        setFrame(0);
    }, ['main']);

    useTick((delta) => {
        setFrame(f => f + (4 / 60) * delta);
    });

    return (
        <GameSprite
            sheetName="main_splash"
            animationName={'main'}
            currentFrame={Math.floor(frame)}
            x={0}
            y={0}
            anchor={0}
            scale={1}
        />
    );
};

interface MainMenuViewProps {
    controller: MainMenuController;
    res?: string;
    setRes?: (r: any) => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({ controller, res, setRes }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        controller.bindView(setSelectedIndex, res, setRes);
        return () => controller.unbindView();
    }, [controller, res, setRes]);

    const menuItems = ["Start Game", "Load Game", "Options", "Legacy Menu"];

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <style>{menuStyles}</style>
            <div style={{
                position: 'relative',
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                backgroundColor: '#000000',
                boxSizing: 'border-box', fontFamily: 'monospace',
                display: 'flex'
            }}>

                <div style={{
                    flex: 1,
                    borderTop: '2.8cqw solid #000000',
                    borderBottom: '2.8cqw solid #000000',
                    padding: '5cqw',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', gap: '1.5cqw',
                    backgroundColor: '#3f3f3f'
                }}>
                    {menuItems.map((label, idx) => (
                        <button
                            key={idx}
                            className={`menu-button ${selectedIndex === idx ? 'menu-button-active' : ''}`}
                            onMouseEnter={() => controller.setHoverIndex(idx)}
                            onClick={() => controller.executeSelected()}
                            style={{
                                padding: '1.2cqw',
                                backgroundColor: selectedIndex === idx ? '#7f0000' : '#400000',
                                color: selectedIndex === idx ? '#ffffff' : '#bfbfbf',
                                borderColor: selectedIndex === idx ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                fontSize: '2cqw', fontWeight: 'bold',
                                textAlign: 'left', textTransform: 'uppercase',
                                transition: 'all 0.1s ease-in-out'
                            }}
                        >
                            {selectedIndex === idx ? `> ${label}` : label}
                        </button>
                    ))}
                </div>

                <div style={{
                    flex: 3,
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <Stage
                        width={240}
                        height={180}
                        options={{
                            backgroundColor: 0x0a0a0a,
                            backgroundAlpha: 0,
                            antialias: false,
                            resolution: 1,
                            autoDensity: false
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            imageRendering: 'pixelated',
                            display: 'block'
                        }}
                    >
                        <PixiForceResizer w={240} h={180} />
                        <MenuAnimatedSprite animationName={'main'} />
                    </Stage>
                </div>

            </div>
        </div>
    );
};

const menuStyles = `
  @keyframes pulse {
    0% { transform: translateX(0); }
    50% { transform: translateX(0.5cqw); }
    100% { transform: translateX(0); }
  }
  .menu-button {
    border-top: none;
    border-left: none;
    border-bottom-width: 0.5cqw;
    border-bottom-style: solid;
    border-right-width: 0.5cqw;
    border-right-style: solid;
    clip-path: polygon(0 0, calc(100% - 3cqw) 0, calc(100% - 3cqw) 1cqw, 100% 1cqw, 100% 100%, 0 100%);
  }
  .menu-button-active {
    animation: pulse 2s infinite ease-in-out;
  }
`;
