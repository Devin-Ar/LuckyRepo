// src/features/BulletTest/view/ui-components/BH_HUD.tsx
import React from 'react';

interface HUDProps {
    hp: number;
    rockCount: number;
    currentWave: number;
    totalWaves: number;
    waveState: string;
    waveDelayTimer: number;
    isRoomCleared: boolean;
    exitDoorActive: boolean;
    exitDoorX: number;
    exitDoorY: number;
    bossHp: number;
    bossVulnerable: boolean;
    gameWidth: number;
    gameHeight: number;
    shieldBarRef: React.RefObject<HTMLDivElement>;
    shieldTextRef: React.RefObject<HTMLSpanElement>;
    damageBtnRef: React.RefObject<HTMLButtonElement>;
    onDamage: () => void;
    onJumpToG2: () => void;
    onLevel1: () => void;
    onLevel2: () => void;
    onLevel3: () => void;
    onLevel4: () => void;
    onResetG1: () => void;
}

export const BH_HUD: React.FC<HUDProps> = ({
                                               hp, rockCount, currentWave, totalWaves, waveState, waveDelayTimer, isRoomCleared,
                                               exitDoorActive, exitDoorX, exitDoorY, bossHp, bossVulnerable, gameWidth, gameHeight,
                                               shieldBarRef, shieldTextRef, damageBtnRef,
                                               onDamage, onJumpToG2, onLevel1, onLevel2, onLevel3, onLevel4, onResetG1
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

    const getWaveStatusText = (): string => {
        if (isRoomCleared) return 'ROOM CLEARED!';
        if (waveState === 'DELAY') return `NEXT WAVE IN ${Math.ceil(waveDelayTimer / 60)}s`;
        if (waveState === 'ACTIVE') return `ENEMIES: ${rockCount}`;
        if (waveState === 'CLEARED') return 'WAVE CLEARED!';
        return 'STANDBY';
    };

    const getWaveStatusColor = (): string => {
        if (isRoomCleared) return '#f1c40f';
        if (waveState === 'DELAY') return '#e67e22';
        if (waveState === 'ACTIVE') return '#e74c3c';
        if (waveState === 'CLEARED') return '#2ecc71';
        return '#888';
    };

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', containerType: 'size' }}>

            {/* Shield Bar - Top Center */}
            <div style={{
                position: 'absolute', top: '5cqh', left: '50%',
                transform: 'translateX(-50%)', width: '35cqw'
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    color: '#fff', marginBottom: '0.5cqh',
                    fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2cqw'
                }}>
                    <span>SHIELD ENERGY</span>
                    <span ref={shieldTextRef}>{Math.round(hp)}%</span>
                </div>
                <div style={{
                    width: '100%', height: '2cqh', backgroundColor: '#222',
                    borderRadius: '1cqw', border: '0.2cqw solid #fff', overflow: 'hidden'
                }}>
                    <div ref={shieldBarRef} style={{
                        width: `${Math.max(0, hp)}%`, height: '100%',
                        backgroundColor: hp < 30 ? '#c0392b' : '#27ae60'
                    }} />
                </div>
            </div>

            {/* Boss Health Bar - Top Center (below Shield Bar) */}
            {bossHp > 0 && (
                <div style={{
                    position: 'absolute', top: '15cqh', left: '50%',
                    transform: 'translateX(-50%)', width: '50cqw'
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        color: bossVulnerable ? '#e74c3c' : '#888', marginBottom: '0.5cqh',
                        fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1cqw'
                    }}>
                        <span>THE CORE {bossVulnerable ? '(VULNERABLE)' : '(PROTECTED)'}</span>
                        <span>{Math.max(0, bossHp)} / 300</span>
                    </div>
                    <div style={{
                        width: '100%', height: '1.5cqh', backgroundColor: '#111',
                        borderRadius: '0.75cqw', border: `0.2cqw solid ${bossVulnerable ? '#e74c3c' : '#444'}`,
                        overflow: 'hidden', boxShadow: bossVulnerable ? '0 0 10px rgba(231, 76, 60, 0.4)' : 'none'
                    }}>
                        <div style={{
                            width: `${(Math.max(0, bossHp) / 300) * 100}%`, height: '100%',
                            backgroundColor: bossVulnerable ? '#e74c3c' : '#444',
                            transition: 'width 0.3s ease-out, background-color 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {/* Wave Info - Top Right */}
            <div style={{
                position: 'absolute', top: '3cqh', right: '3cqw',
                color: '#fff', fontFamily: 'monospace', textAlign: 'right', fontSize: '1.2cqw'
            }}>
                <div style={{
                    color: getWaveStatusColor(),
                    fontSize: '1.4cqw', fontWeight: 'bold', marginBottom: '0.5cqh'
                }}>
                    WAVE {currentWave + 1} / {totalWaves}
                </div>
                <div style={{ color: getWaveStatusColor(), fontSize: '1cqw' }}>
                    {getWaveStatusText()}
                </div>
                <div style={{ color: '#888', fontSize: '0.8cqw', marginTop: '0.3cqh' }}>
                    ENEMIES_ACTIVE: {rockCount}
                </div>
            </div>

            {/* Room Cleared Banner - Center */}
            {isRoomCleared && (
                <div style={{
                    position: 'absolute', top: '40%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#f1c40f', fontFamily: 'monospace',
                    fontSize: '3cqw', fontWeight: 'bold',
                    textShadow: '0 0 20px rgba(241, 196, 60, 0.6)',
                    textAlign: 'center', letterSpacing: '0.3cqw'
                }}>
                    ALL WAVES CLEARED
                    <div style={{ fontSize: '1.2cqw', color: '#fff', marginTop: '1cqh' }}>
                        PROCEED TO EXIT
                    </div>
                </div>
            )}

            {/* Exit Door - rendered as a square in game space */}
            {exitDoorActive && gameWidth > 0 && gameHeight > 0 && (
                <div style={{
                    position: 'absolute',
                    left: `${(exitDoorX / gameWidth) * 100}%`,
                    top: `${(exitDoorY / gameHeight) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '6.25%',   /* ~60px at 960 width */
                    height: '11.1%',  /* ~60px at 540 height */
                    border: '3px solid #f1c40f',
                    backgroundColor: 'rgba(241, 196, 60, 0.25)',
                    boxShadow: '0 0 20px rgba(241, 196, 60, 0.5), inset 0 0 15px rgba(241, 196, 60, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'exitDoorPulse 1.5s ease-in-out infinite'
                }}>
                    <span style={{
                        color: '#f1c40f',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        fontSize: '0.9cqw',
                        textShadow: '0 0 8px rgba(241, 196, 60, 0.8)'
                    }}>
                        EXIT
                    </span>
                </div>
            )}

            {/* Exit door pulse animation */}
            {exitDoorActive && (
                <style>{`
                    @keyframes exitDoorPulse {
                        0%, 100% { box-shadow: 0 0 20px rgba(241, 196, 60, 0.5), inset 0 0 15px rgba(241, 196, 60, 0.3); }
                        50% { box-shadow: 0 0 35px rgba(241, 196, 60, 0.8), inset 0 0 25px rgba(241, 196, 60, 0.5); }
                    }
                `}</style>
            )}

            {/* Delay Countdown Overlay - Center (during delay phase) */}
            {waveState === 'DELAY' && waveDelayTimer > 0 && (
                <div style={{
                    position: 'absolute', top: '35%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#e67e22', fontFamily: 'monospace',
                    fontSize: '2cqw', fontWeight: 'bold',
                    textShadow: '0 0 15px rgba(230, 126, 34, 0.5)',
                    textAlign: 'center', opacity: 0.9
                }}>
                    WAVE {currentWave + 1} INCOMING
                    <div style={{ fontSize: '4cqw', color: '#fff', marginTop: '0.5cqh' }}>
                        {Math.ceil(waveDelayTimer / 60)}
                    </div>
                </div>
            )}

            {/* Dev Controls - Bottom Left */}
            <div style={{
                position: 'absolute', top: '3cqh', left: '3cqw',
                display: 'flex', flexDirection: 'column', gap: '1cqh'
            }}>
                <button ref={damageBtnRef} onClick={onDamage}
                        style={{ ...btnStyle, background: '#333', border: '0.1cqw solid #fff' }}>
                    TAKE DAMAGE (-15)
                </button>

                <div style={{ display: 'flex', gap: '0.5cqw' }}>
                    <button onClick={onLevel1} style={{ ...btnStyle, background: '#408240', flex: 1 }}>LVL 1</button>
                    <button onClick={onLevel2} style={{ ...btnStyle, background: '#C29F19', flex: 1 }}>LVL 2</button>
                    <button onClick={onLevel3} style={{ ...btnStyle, background: '#C21919', flex: 1 }}>LVL 3</button>
                    <button onClick={onLevel4} style={{ ...btnStyle, background: '#8E44AD', flex: 1 }}>LVL 4</button>
                </div>

                <button onClick={onJumpToG2} style={{ ...btnStyle, background: '#2980b9' }}>
                    Go to Game 2
                </button>

                <div style={{ display: 'flex', gap: '0.5cqw' }}>
                    <button onClick={onResetG1} style={{ ...btnStyle, background: '#c0392b', flex: 1 }}>
                        Quick Load
                    </button>
                </div>
            </div>
        </div>
    );
};