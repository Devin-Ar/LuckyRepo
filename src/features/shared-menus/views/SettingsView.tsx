// src/features/shared-menus/views/SettingsViews.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SettingsMenuController } from '../controllers/SettingsMenuController';

interface SettingsViewProps {
    controller: SettingsMenuController;
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
const controlGroupStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '1.5cqw',
    minWidth: '20cqw', justifyContent: 'flex-end'
};
const sliderStyle: React.CSSProperties = { cursor: 'pointer', accentColor: '#00ff00', width: '12cqw' };
const inputStyle: React.CSSProperties = {
    backgroundColor: '#000', color: '#00ff00', border: '1px solid #00ff00',
    padding: '0.5cqw', fontFamily: 'monospace', outline: 'none'
};

export const SettingsView: React.FC<SettingsViewProps> = ({ controller, res, setRes }) => {
    const [activeTab, setActiveTab] = useState<'system' | 'controls'>('system');
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const [localRes, setLocalRes] = useState(res || controller.getResolution());
    const [vols, setVols] = useState({
        master: controller.getVolume('master'),
        ost: controller.getVolume('ost'),
        sfx: controller.getVolume('sfx')
    });

    const [selectedProfile, setSelectedProfile] = useState<string>("Shared");
    const [bindingTarget, setBindingTarget] = useState<{action: string, slot: number} | null>(null);
    const [viewBinds, setViewBinds] = useState<Record<string, string[]>>({});

    const refreshViewBinds = useCallback(() => {
        const merged = controller.getBindingsForGame(selectedProfile);
        setViewBinds(merged);
    }, [selectedProfile, controller]);

    useEffect(() => {
        controller.registerBindRefresh(refreshViewBinds);
        refreshViewBinds();
    }, [refreshViewBinds, controller]);

    useEffect(() => {
        if (!bindingTarget) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const key = e.key.toUpperCase();
            controller.setBinding(bindingTarget.action, key, selectedProfile, bindingTarget.slot);

            setBindingTarget(null);
            refreshViewBinds();
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [bindingTarget, controller, refreshViewBinds, selectedProfile]);

    const handleVolumeChange = (cat: 'master' | 'ost' | 'sfx', val: number) => {
        setVols(prev => ({ ...prev, [cat]: val }));
        controller.setVolume(cat, val);
    };

    const handleResChange = (newRes: string) => {
        setLocalRes(newRes);
        controller.setResolution(newRes);
        if (setRes) setRes(newRes);
    };

    const toggleFullscreen = async () => {
        const isFull = await controller.toggleFullscreen();
        setIsFullscreen(isFull);
    };

    const handleReset = () => {
        controller.resetBindings(selectedProfile);
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
                                <select value={localRes} onChange={(e) => handleResChange(e.target.value)} style={inputStyle}>
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
                                    value={selectedProfile}
                                    onChange={(e) => setSelectedProfile(e.target.value)}
                                    style={{...inputStyle, width: '25cqw'}}
                                >
                                    {controller.getRegistryProfiles().map(name => (
                                        <option key={name} value={name}>{name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <p style={{ color: '#888', marginBottom: '1cqw', fontSize: '0.8em' }}>
                                CONFIGURING: {selectedProfile.toUpperCase()}
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
                            RESET_DEFAULTS_[{selectedProfile.toUpperCase()}]
                        </button>
                    )}

                    <button
                        onClick={() => controller.onBack()}
                        style={{...btnStyle, background: '#111', borderColor: '#444', color: '#888'}}
                    >
                        EXIT_CONFIG
                    </button>
                </div>
            </div>
        </div>
    );
};