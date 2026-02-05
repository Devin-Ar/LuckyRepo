// src/features/Game3/view/Game3View.tsx
import React from 'react';
import { Stage } from '@pixi/react';
import { Game3Presenter } from './Game3Presenter';
import { Game3Controller } from './Game3Controller';
import { Game3HUD } from './ui-components/Game3HUD';
import { Game3Simulation } from './ui-components/Game3Simulation';
import { Game3Level } from '../model/Game3Config';
import { IGameViewProps } from '../../../core/interfaces/IViewProps';

export const Game3View: React.FC<IGameViewProps<Game3Presenter, Game3Controller>> = ({
                                                                                         vm, controller
                                                                                     }) => {
    const [tick, setTick] = React.useState(0);
    React.useEffect(() => {
        const unsubscribe = vm.subscribe(() => setTick(t => t + 1));
        return () => unsubscribe();
    }, [vm]);

    const stats = vm.stats;
    const visuals = vm.visualEffects;

    // We define a fixed internal resolution for the simulation.
    // CSS handle the scaling/letterboxing.
    const VIRTUAL_W = 1920;
    const VIRTUAL_H = 1080;

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
                background: '#050508',
                overflow: 'hidden',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)'
            }}>
                {/* Background Layer */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, #1a1a2e 0%, #050508 100%)',
                    opacity: 0.6
                }}/>

                {/* PixiJS Simulation: Set to 1080p internal resolution */}
                <Stage
                    width={VIRTUAL_W}
                    height={VIRTUAL_H}
                    options={{ backgroundColor: 0x000000, backgroundAlpha: 0, antialias: true }}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        imageRendering: 'pixelated'
                    }}
                >
                    <Game3Simulation vm={vm} width={VIRTUAL_W} height={VIRTUAL_H}/>
                </Stage>

                {/* Cinematic Overlays */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    boxShadow: `inset 0 0 ${120 + visuals.vignettePulse * 40}px rgba(0,0,0,0.9)`,
                    mixBlendMode: 'multiply'
                }}/>

                {/* HUD Layer */}
                <Game3HUD
                    stats={stats}
                    onAction={(type, val) => {
                        if (type === 'MOD_HP') controller.modifyHP(val || 0);
                    }}
                    onLevel1={() => controller.loadLevel(Game3Level.Level1)}
                    onLevel2={() => controller.loadLevel(Game3Level.Level2)}
                    onLevel3={() => controller.loadLevel(Game3Level.Level3)}
                    onQuickLoad={() => controller.resetLevel()}
                />
            </div>
        </div>
    );
};