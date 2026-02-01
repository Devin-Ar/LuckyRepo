// src/features/Game2/view/ui/Game2HUD.tsx
import React from 'react';

interface HUDProps {
    stats: { hp: number; energy: number; scrap: number };
    onAction: (type: string, val?: number) => void;
    onJumpG1: () => void;
    onLevel1: () => void;
    onLevel2: () => void;
    onLevel3: () => void;
    onQuickLoad: () => void;
    onNextLevel: () => void;
    onFailLevel: () => void;
}

export const Game2HUD: React.FC<HUDProps> = ({
                                                 stats, onAction, onJumpG1, onLevel1, onLevel2, onLevel3, onQuickLoad, onNextLevel, onFailLevel
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
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#00ff00', fontFamily: 'monospace'}}>
                <h2 style={{fontSize: '1.5cqw', margin: 0}}>SYSTEM_DIAGNOSTICS</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqh', alignItems: 'flex-end'}}>
                    {/* Level Select Row */}
                    <div style={{display: 'flex', gap: '0.5cqw'}}>
                        <button onClick={onLevel1} style={{...btnStyle, background: '#1b4d1b'}}>LVL 1</button>
                        <button onClick={onLevel2} style={{...btnStyle, background: '#4d431b'}}>LVL 2</button>
                        <button onClick={onLevel3} style={{...btnStyle, background: '#4d1b1b'}}>LVL 3</button>
                    </div>
                    {/* Control Row */}
                    <div style={{display: 'flex', gap: '0.5cqw'}}>
                        <button onClick={onNextLevel} style={{...btnStyle, borderColor: '#8e44ad', color: '#67ad44'}}>NEXT_STEP</button>
                        <button onClick={onFailLevel} style={{...btnStyle, borderColor: '#8e44ad', color: '#ad4444'}}>FAIL_STEP</button>
                        <button onClick={onJumpG1} style={{...btnStyle, borderColor: '#3498db'}}>GOTO_G1</button>
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
                <div style={{...cardStyle, borderColor: '#00ff00', color: '#00ff00'}}>
                    <span>GLOBAL_HP</span>
                    <b style={{fontSize: '2cqw'}}>{stats.hp.toFixed(1)}</b>
                    <div style={{display: 'flex', gap: '0.5cqw'}}>
                        <button onClick={() => onAction('MOD_HP', 10)} style={btnStyle}>+10</button>
                        <button onClick={() => onAction('MOD_HP', -10)} style={btnStyle}>-10</button>
                    </div>
                </div>

                <div style={{...cardStyle, borderColor: '#3498db', color: '#3498db'}}>
                    <span>GLOBAL_ENERGY</span>
                    <b style={{fontSize: '2cqw'}}>{stats.energy}</b>
                    <button onClick={() => onAction('MOD_ENERGY', 5)} style={btnStyle}>RECHARGE</button>
                </div>

                <div style={{...cardStyle, borderColor: '#f1c40f', color: '#f1c40f'}}>
                    <span>LOCAL_SCRAP</span>
                    <b style={{fontSize: '2cqw'}}>{stats.scrap}</b>
                    <button onClick={() => onAction('ADD_SCRAP')} style={btnStyle}>COLLECT</button>
                </div>
            </div>
        </div>
    );
};