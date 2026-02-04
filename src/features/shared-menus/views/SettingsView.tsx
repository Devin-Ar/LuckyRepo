// src/features/shared-menus/views/SettingsViews.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SharedSession } from '../../../core/session/SharedSession';
import { AudioManager } from '../../../core/managers/AudioManager';
import { InputManager } from '../../../core/managers/InputManager';
import { INPUT_REGISTRY } from '../../../core/registry/InputRegistry';

interface SettingsViewProps {
    onBack: () => void;
    res?: string;
    setRes?: (r: string) => void;
}

const btnStyle: React.CSSProperties = {
    padding: '0.8cqw 2cqw', cursor: 'pointer', border: '1px solid #00ff00',
    background: '#000', color: '#00ff00', fontWeight: 'bold', fontFamily: 'monospace'
};
const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1cqw 1.5cqw', borderBottom: '1px solid #1a1a1a'
};
const controlGroupStyle = {
    display: 'flex', alignItems: 'center', gap: '1.5cqw',
    minWidth: '20cqw', justifyContent: 'flex-end'
};
const sliderStyle = { cursor: 'pointer', accentColor: '#00ff00', width: '12cqw' };
const inputStyle = {
    backgroundColor: '#000', color: '#00ff00', border: '1px solid #00ff00',
    padding: '0.5cqw', fontFamily: 'monospace', outline: 'none'
};

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, res, setRes }) => {
    const session = SharedSession.getInstance();
    const audio = AudioManager.getInstance();
    const input = InputManager.getInstance();

    const [activeTab, setActiveTab] = useState<'system' | 'controls'>('system');
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const [vols, setVols] = useState({
        master: session.get<number>('master_volume') ?? 0.5,
        ost: session.get<number>('ost_volume') ?? 0.5,
        sfx: session.get<number>('sfx_volume') ?? 0.5
    });

    const [selectedGameProfile, setSelectedGameProfile] = useState<string>("Shared");
    const [bindingTarget, setBindingTarget] = useState<{action: string, slot: number} | null>(null);
    const [viewBinds, setViewBinds] = useState<Record<string, string[]>>({});

    const refreshViewBinds = useCallback(() => {
        const gameName = selectedGameProfile;
        const base = { ...INPUT_REGISTRY[gameName] };
        const overrides = session.get<Record<string, string[]>>(`bind_${gameName}`) || {};
        const merged = { ...base, ...overrides };

        setViewBinds(merged);
    }, [selectedGameProfile, session]);

    useEffect(() => {
        refreshViewBinds();
    }, [refreshViewBinds]);

    useEffect(() => {
        if (!bindingTarget) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const key = e.key.toUpperCase();
            input.setBinding(bindingTarget.action, key, selectedGameProfile, bindingTarget.slot);

            setBindingTarget(null);
            refreshViewBinds();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bindingTarget, input, refreshViewBinds, selectedGameProfile]);

    const handleVolumeChange = (cat: 'master' | 'ost' | 'sfx', val: number) => {
        setVols(prev => ({ ...prev, [cat]: val }));
        session.set(`${cat}_volume`, val);
        audio.setVolume(cat, val);
    };

    const handleResChange = (newRes: string) => {
        setRes?.(newRes);
        session.set('resolution', newRes);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleReset = () => {
        input.resetBindings(selectedGameProfile);
        refreshViewBinds();
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
            <div style={{
                width: '85%', height: '80%', background: '#050505', border: '2px solid #00ff00',
                padding: '2cqw', display: 'flex', flexDirection: 'column', color: '#00ff00',
                fontFamily: 'monospace', containerType: 'size'
            }}>

                <div style={{ display: 'flex', gap: '2cqw', borderBottom: '2px solid #00ff00', marginBottom: '1cqw' }}>
                    <h2 onClick={() => setActiveTab('system')}
                        style={{ cursor: 'pointer', opacity: activeTab === 'system' ? 1 : 0.4, paddingBottom: '0.5cqw' }}>
                        [ SYSTEM_CONFIGURATION ]
                    </h2>
                    <h2 onClick={() => setActiveTab('controls')}
                        style={{ cursor: 'pointer', opacity: activeTab === 'controls' ? 1 : 0.4, paddingBottom: '0.5cqw' }}>
                        [ INPUT_BINDINGS ]
                    </h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1cqw' }}>
                    {activeTab === 'system' ? (
                        <>
                            <div style={rowStyle}>
                                <span>MASTER_OUTPUT_LEVEL</span>
                                <div style={controlGroupStyle}>
                                    <span>{Math.round(vols.master * 100)}%</span>
                                    <input type="range" min="0" max="1" step="0.01" value={vols.master}
                                           onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                                           style={sliderStyle}/>
                                </div>
                            </div>
                            <div style={rowStyle}>
                                <span>OST_SEQUENCE_LEVEL</span>
                                <div style={controlGroupStyle}>
                                    <span>{Math.round(vols.ost * 100)}%</span>
                                    <input type="range" min="0" max="1" step="0.01" value={vols.ost}
                                           onChange={(e) => handleVolumeChange('ost', parseFloat(e.target.value))}
                                           style={sliderStyle}/>
                                </div>
                            </div>
                            <div style={rowStyle}>
                                <span>SFX_IMPULSE_LEVEL</span>
                                <div style={controlGroupStyle}>
                                    <span>{Math.round(vols.sfx * 100)}%</span>
                                    <input type="range" min="0" max="1" step="0.01" value={vols.sfx}
                                           onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                                           style={sliderStyle}/>
                                </div>
                            </div>

                            <div style={rowStyle}>
                                <span>DISPLAY_RESOLUTION</span>
                                <select value={res} onChange={(e) => handleResChange(e.target.value)} style={inputStyle}>
                                    {['540p', '720p', '1080p', '1440p', '4k', 'fit'].map(r => (
                                        <option key={r} value={r}>{r.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={rowStyle}>
                                <span>WINDOW_MODE</span>
                                <button onClick={toggleFullscreen} style={btnStyle}>
                                    {isFullscreen ? '[ FULLSCREEN ]' : '[ WINDOWED ]'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div>
                            {/* Registry Profile Selector */}
                            <div style={{ ...rowStyle, borderBottom: '2px solid #333', marginBottom: '1.5cqw' }}>
                                <span style={{ color: '#888' }}>SELECT_REGISTRY_CONTEXT:</span>
                                <select
                                    value={selectedGameProfile}
                                    onChange={(e) => setSelectedGameProfile(e.target.value)}
                                    style={{...inputStyle, width: '25cqw'}}
                                >
                                    {Object.keys(INPUT_REGISTRY).map(name => (
                                        <option key={name} value={name}>{name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <p style={{ color: '#888', marginBottom: '1cqw', fontSize: '0.8em' }}>
                                CONFIGURING: {selectedGameProfile.toUpperCase()}
                            </p>

                            {Object.entries(viewBinds).map(([action, keys]) => (
                                <div key={action} style={rowStyle}>
                                    <span style={{ flex: 1 }}>{action.toUpperCase().replace('_', ' ')}</span>
                                    <div style={{ display: 'flex', gap: '1cqw' }}>
                                        {[0, 1].map(slotIndex => {
                                            const isBinding = bindingTarget?.action === action && bindingTarget?.slot === slotIndex;
                                            return (
                                                <button
                                                    key={slotIndex}
                                                    onClick={() => setBindingTarget({ action, slot: slotIndex })}
                                                    style={{
                                                        ...btnStyle,
                                                        width: '12cqw',
                                                        borderColor: isBinding ? '#fff' : '#00ff00',
                                                        color: isBinding ? '#fff' : '#00ff00'
                                                    }}
                                                >
                                                    {isBinding ? '???' : `[ ${keys[slotIndex] || '---'} ]`}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: 'auto',
                    textAlign: 'right',
                    paddingTop: '1cqw',
                    borderTop: '1px solid #00ff00',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1cqw'
                }}>
                    {/* Only show RESET when on the controls tab */}
                    {activeTab === 'controls' && (
                        <button
                            onClick={handleReset}
                            style={{
                                ...btnStyle,
                                borderColor: '#ff4444',
                                color: '#ff4444',
                                background: 'rgba(255, 0, 0, 0.1)'
                            }}
                        >
                            RESET_DEFAULTS_[{selectedGameProfile.toUpperCase()}]
                        </button>
                    )}

                    <button
                        onClick={onBack}
                        style={{...btnStyle, background: '#111', borderColor: '#444', color: '#888'}}
                    >
                        EXIT_CONFIG
                    </button>
                </div>
            </div>
        </div>
    );
};