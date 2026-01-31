// src/features/Game1/view/ui-components/Game1HUD.tsx
import React from 'react';

interface HUDProps {
    hp: number;
    rockCount: number;
    shieldBarRef: React.RefObject<HTMLDivElement>;
    shieldTextRef: React.RefObject<HTMLSpanElement>;
    damageBtnRef: React.RefObject<HTMLButtonElement>;
    onDamage: () => void;
    onJumpToG2: () => void;
    onLevel1: () => void;
    onLevel2: () => void;
    onLevel3: () => void;
    onResetG1: () => void;
}

export const BH_HUD: React.FC<HUDProps> = ({
                                                 hp, rockCount, shieldBarRef, shieldTextRef, damageBtnRef,
                                                 onDamage, onJumpToG2, onLevel1, onLevel2, onLevel3, onResetG1
                                             }) => {
    const btnStyle: React.CSSProperties = {
        padding: '0.6cqw 1cqw',
        cursor: 'pointer',
        color: '#fff',
        border: 'none',
        borderRadius: '0.4cqw',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: '0.8cqw',
        pointerEvents: 'auto',
        textAlign: 'center'
    };

    return (
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', containerType: 'size'}}>
            <div
                style={{position: 'absolute', top: '5cqh', left: '50%', transform: 'translateX(-50%)', width: '35cqw'}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#fff',
                    marginBottom: '0.5cqh',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    fontSize: '1.2cqw'
                }}>
                    <span>SHIELD ENERGY</span>
                    <span ref={shieldTextRef}>{Math.round(hp)}%</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '2cqh',
                    backgroundColor: '#222',
                    borderRadius: '1cqw',
                    border: '0.2cqw solid #fff',
                    overflow: 'hidden'
                }}>
                    <div ref={shieldBarRef} style={{
                        width: `${Math.max(0, hp)}%`,
                        height: '100%',
                        backgroundColor: hp < 30 ? '#c0392b' : '#27ae60'
                    }}/>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '3cqh',
                right: '3cqw',
                color: '#fff',
                fontFamily: 'monospace',
                textAlign: 'right',
                fontSize: '1.2cqw'
            }}>
                ROCKS_ACTIVE: {rockCount}
            </div>

            <div style={{
                position: 'absolute',
                top: '3cqh',
                left: '3cqw',
                display: 'flex',
                flexDirection: 'column',
                gap: '1cqh'
            }}>
                <button ref={damageBtnRef} onClick={onDamage}
                        style={{...btnStyle, background: '#333', border: '0.1cqw solid #fff'}}>
                    TAKE DAMAGE (-15)
                </button>

                <div style={{display: 'flex', gap: '0.5cqw'}}>
                    <button onClick={onLevel1} style={{...btnStyle, background: '#408240', flex: 1}}>LVL 1</button>
                    <button onClick={onLevel2} style={{...btnStyle, background: '#C29F19', flex: 1}}>LVL 2</button>
                    <button onClick={onLevel3} style={{...btnStyle, background: '#C21919', flex: 1}}>LVL 3</button>
                </div>

                <button onClick={onJumpToG2} style={{...btnStyle, background: '#2980b9'}}>
                    Go to Game 2
                </button>

                <div style={{display: 'flex', gap: '0.5cqw'}}>
                    <button onClick={onResetG1} style={{...btnStyle, background: '#c0392b', flex: 1}}>Quick Load
                    </button>
                </div>
            </div>
        </div>
    );
};