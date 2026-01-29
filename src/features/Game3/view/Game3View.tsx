// src/features/Game3/view/Game3View.tsx
import React, {useMemo} from 'react';
import {Stage} from '@pixi/react';
import {Game3Presenter} from './Game3Presenter';
import {Game3Controller} from './Game3Controller';
import {Game3HUD} from './ui-components/Game3HUD';
import {Game3Simulation} from './ui-components/Game3Simulation';
import {Game3Level} from '../model/Game3Config';

import {IGameViewProps} from '../../../core/interfaces/IViewProps';

export const Game3View: React.FC<IGameViewProps<Game3Presenter, Game3Controller>> = ({
                                                                                         vm,
                                                                                         controller,
                                                                                         width = 960,
                                                                                         height = 540
                                                                                     }) => {
    const [tick, setTick] = React.useState(0);

    React.useEffect(() => {
        const unsubscribe = vm.subscribe(() => {
            setTick(t => t + 1);
        });
        return () => unsubscribe();
    }, [vm]);

    const stats = vm.stats;
    const visuals = vm.visualEffects;

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* The 16:9 Container to match Game1 and Game2 style */}
            <div style={{
                position: 'relative',
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                background: '#0a0a0c',
                overflow: 'hidden'
            }}>
                {/* Background Layer */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1a 100%)',
                    opacity: 0.8
                }}/>

                {/* Simulation Layer (PIXI) */}
                <Stage
                    width={width}
                    height={height}
                    options={{backgroundColor: 0x000000, backgroundAlpha: 0, antialias: true}}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated'
                    }}
                >
                    <Game3Simulation vm={vm} width={width} height={height}/>
                </Stage>

                {/* UI Layer */}
                <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#050505', fontSize: '10cqw', fontWeight: 'bold',
                        transform: `translateY(${visuals.uiOffset}px)`,
                        opacity: 0.3 + (visuals.glitchIntensity * 0.7)
                    }}>
                        GAME_03
                    </div>

                    <Game3HUD
                        stats={stats}
                        onAction={(type, val) => controller.modifyStat(type as any, val)}
                        onJumpG1={controller.jumpToGame1}
                        onLevel1={() => controller.loadLevel(Game3Level.Level1)}
                        onLevel2={() => controller.loadLevel(Game3Level.Level2)}
                        onLevel3={() => controller.loadLevel(Game3Level.Level3)}
                        onQuickLoad={() => controller.resetLevel()}
                    />
                </div>

                {/* Post-processing overlays */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    boxShadow: `inset 0 0 ${100 + visuals.vignettePulse * 50}px rgba(0,0,0,0.8)`,
                    mixBlendMode: 'multiply'
                }}/>
            </div>
        </div>
    );
};
