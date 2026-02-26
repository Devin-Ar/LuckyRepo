// src/features/Game3/view/Game3View.tsx
import React, { useMemo } from 'react';
import { Stage } from '@pixi/react';
import { Game3Presenter } from './Game3Presenter';
import { Game3Controller } from './Game3Controller';
import { Game3HUD } from './ui-components/Game3HUD';
import { Game3Simulation } from './ui-components/Game3Simulation';
import { Game3Minimap } from './ui-components/Game3Minimap';
import { Game3Level } from '../model/Game3Config';
import { IGameViewProps } from '../../../core/interfaces/IViewProps';

export const Game3View: React.FC<IGameViewProps<Game3Presenter, Game3Controller>> = ({
                                                                                         vm, controller, width = 960, height = 540
                                                                                     }) => {
    const [tick, setTick] = React.useState(0);
    React.useEffect(() => {
        const unsubscribe = vm.subscribe(() => setTick(t => t + 1));
        return () => unsubscribe();
    }, [vm]);

    const stats = vm.stats;
    const visuals = vm.visualEffects;

    const stageOptions = useMemo(() => ({
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: false,
        roundPixels: true,
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
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, #1a1a2e 0%, #050508 100%)',
                    opacity: 0.6
                }}/>

                <Stage
                    key={`game3-stage-${width}-${height}`}
                    width={width}
                    height={height}
                    options={stageOptions}
                    style={stageStyle}
                >
                    <Game3Simulation vm={vm} width={width} height={height} />
                </Stage>

                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    boxShadow: `inset 0 0 ${120 + visuals.vignettePulse * 40}px rgba(0,0,0,0.9)`,
                    mixBlendMode: 'multiply'
                }}/>

                {/* Minimap overlay - bottom right corner */}
                <Game3Minimap vm={vm} size={250} />

                <Game3HUD
                    stats={stats}
                    onAction={(type, val) => { if (type === 'MOD_HP') controller.modifyHP(val || 0); }}
                    onLevel1={() => controller.loadLevel(Game3Level.Level1)}
                    onLevel2={() => controller.loadLevel(Game3Level.Level2)}
                    onLevel3={() => controller.loadLevel(Game3Level.Level3)}
                    onLevel4={() => controller.loadLevel(Game3Level.Level4)}
                    onLevel5={() => controller.loadLevel(Game3Level.Level5)}
                    onQuickLoad={() => controller.resetLevel()}
                />
            </div>
        </div>
    );
};