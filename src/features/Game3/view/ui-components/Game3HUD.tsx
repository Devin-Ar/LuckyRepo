// src/features/Game3/view/ui-components/Game3HUD.tsx
import React, { useEffect, useState } from 'react';

// Sprite paths — 2-frame horizontal spritesheets (64x32, each frame 32x32)
const POINT_SPRITE_PATH = 'res/sprite/sheets/Point.png';
const COIN_SPRITE_PATH = 'res/sprite/sheets/Coin.png';

interface HUDProps {
    stats: { hp: number };
    points: number;
    coins: number;
    onAction: (type: string, val?: number) => void;
    onLevel1: () => void;
    onLevel2: () => void;
    onLevel3: () => void;
    onLevel4: () => void;
    onLevel5: () => void;
    onQuickLoad: () => void;
}

/**
 * Animated 2-frame sprite icon from a horizontal spritesheet (64x32).
 * Clips to show one 32x32 frame at a time, alternating on interval.
 */
const SpriteIcon: React.FC<{ src: string; size?: string; intervalMs?: number }> = ({
                                                                                       src, size = '5cqw', intervalMs = 500
                                                                                   }) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setFrame(f => (f + 1) % 2), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return (
        <div style={{
            width: size,
            height: size,
            overflow: 'hidden',
            flexShrink: 0,
            marginRight: '0.5cqw',
            imageRendering: 'pixelated',
            position: 'relative'
        }}>
            <img
                src={src}
                alt=""
                draggable={false}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: frame === 0 ? '0%' : '-100%',
                    height: '100%',
                    width: '200%',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export const Game3HUD: React.FC<HUDProps> = ({
                                                 stats, points, coins, onAction,
                                                 onLevel1, onLevel2, onLevel3, onLevel4, onLevel5, onQuickLoad
                                             }) => {
    const cardStyle: React.CSSProperties = {
        padding: '1.5cqw', border: '0.1cqw solid', borderRadius: '0.5cqw',
        display: 'flex', flexDirection: 'column', gap: '1cqh'
    };

    const btnStyle: React.CSSProperties = {
        padding: '0.5cqw 1cqw', cursor: 'pointer', background: '#222',
        color: '#eee', border: '0.1cqw solid #444', fontSize: '0.8cqw',
        pointerEvents: 'auto'
    };

    return (
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', containerType: 'size', padding: '2cqw'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#ffcc00', fontFamily: 'monospace'}}>
                <h2 style={{fontSize: '1.5cqw', margin: 0}}>PLATFORMER_PROTOTYPE</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqh', alignItems: 'flex-end'}}>
                    <div style={{display: 'flex', gap: '0.5cqw'}}>
                        <button onClick={onLevel1} style={{...btnStyle, background: '#1b4d1b'}}>LVL 1</button>
                        <button onClick={onLevel2} style={{...btnStyle, background: '#4d431b'}}>LVL 2</button>
                        <button onClick={onLevel3} style={{...btnStyle, background: '#4d1b1b'}}>LVL 3</button>
                        <button onClick={onLevel4} style={{...btnStyle, background: '#1b1b4d'}}>LVL 4</button>
                        <button onClick={onLevel5} style={{...btnStyle, background: '#1b1b4d'}}>LVL 5</button>
                    </div>
                    <div style={{display: 'flex', gap: '0.5cqw'}}>
                        <button onClick={onQuickLoad} style={{...btnStyle, borderColor: '#c0392b'}}>RELOAD</button>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2cqw',
                marginTop: '2cqh',
                pointerEvents: 'auto'
            }}>
                <div style={{...cardStyle, borderColor: '#ff3333', color: '#ff3333'}}>
                    <span>HERO_HP</span>
                    <b style={{fontSize: '2cqw'}}>{stats.hp.toFixed(1)}</b>
                    <div style={{display: 'flex', gap: '0.5cqw'}}>
                        <button onClick={() => onAction('MOD_HP', 10)} style={btnStyle}>+10</button>
                        <button onClick={() => onAction('MOD_HP', -10)} style={btnStyle}>-10</button>
                    </div>
                </div>
            </div>

            {/* Points & Coins - Bottom Left */}
            <div style={{
                position: 'absolute', bottom: '3cqh', left: '3cqw',
                display: 'flex', flexDirection: 'column', gap: '0.8cqh',
                fontFamily: 'monospace', fontSize: '1.4cqw', fontWeight: 'bold'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    color: '#f1c40f',
                    textShadow: '0 0 8px rgba(241, 196, 15, 0.4)'
                }}>
                    <SpriteIcon src={POINT_SPRITE_PATH} />
                    <span>{points.toLocaleString()}</span>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    color: '#ffd700',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
                }}>
                    <SpriteIcon src={COIN_SPRITE_PATH} />
                    <span>{coins.toLocaleString()}</span>
                </div>
            </div>

            <div style={{position: 'absolute', bottom: '2cqh', right: '2cqw', color: '#fff', fontSize: '0.8cqw', opacity: 0.7}}>
                Controls: A/D/Arrows - Move, Space/W/Up - Jump
            </div>
        </div>
    );
};