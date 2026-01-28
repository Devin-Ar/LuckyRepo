// src/features/shared-menus/views/SettingsViews.tsx
import React, {useState} from 'react';
import {SharedSession} from '../../../core/session/SharedSession';
import {AudioManager} from '../../../core/managers/AudioManager';

interface SettingsViewProps {
    onBack: () => void;
    res?: string;
    setRes?: (r: string) => void;
}

const controlGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5cqw',
    minWidth: '20cqw',
    justifyContent: 'flex-end'
};
const sliderStyle = {cursor: 'pointer', accentColor: '#00ff00', width: '12cqw'};
const inputStyle = {
    backgroundColor: '#000',
    color: '#00ff00',
    border: '1px solid #00ff00',
    padding: '0.5cqw',
    fontFamily: 'monospace',
    outline: 'none'
};
const btnStyle = {
    padding: '0.8cqw 2cqw',
    cursor: 'pointer',
    border: '1px solid #00ff00',
    background: '#000',
    color: '#00ff00',
    fontWeight: 'bold' as const,
    fontFamily: 'monospace'
};

export const SettingsView: React.FC<SettingsViewProps> = ({onBack, res, setRes}) => {
    const session = SharedSession.getInstance();
    const audio = AudioManager.getInstance();

    const [vols, setVols] = useState({
        master: session.get<number>('master_volume') ?? 0.5,
        ost: session.get<number>('ost_volume') ?? 0.5,
        sfx: session.get<number>('sfx_volume') ?? 0.5
    });

    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    const handleVolumeChange = (cat: 'master' | 'ost' | 'sfx', val: number) => {
        setVols(prev => ({...prev, [cat]: val}));
        session.set(`${cat}_volume`, val);
        audio.setVolume(cat, val);
    };

    const handleResChange = (newRes: string) => {
        setRes?.(newRes);
        session.set('resolution', newRes);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const containerStyle: React.CSSProperties = {
        width: '100%', height: '100%',
        maxWidth: 'calc(100vh * (16 / 9))',
        maxHeight: 'calc(100vw * (9 / 16))',
        aspectRatio: '16 / 9',
        backgroundColor: 'rgba(5, 5, 5, 0.98)',
        color: '#00ff00', fontFamily: 'monospace', display: 'flex',
        flexDirection: 'column', padding: '4cqw', boxSizing: 'border-box',
        position: 'relative', zIndex: 1200,
        textShadow: '0 0 5px rgba(0, 255, 0, 0.3)',
        containerType: 'size'
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1cqw 1.5cqw', borderBottom: '1px solid #1a1a1a'
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
            <div style={containerStyle}>
                <h2 style={{borderBottom: '2px solid #00ff00', paddingBottom: '1cqw', letterSpacing: '0.2cqw'}}>
                    SYSTEM_CONFIGURATION
                </h2>

                <div style={{marginTop: '1cqw'}}>
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
                        <select
                            value={res}
                            onChange={(e) => handleResChange(e.target.value)}
                            style={inputStyle}
                        >
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
                </div>

                <div
                    style={{marginTop: 'auto', textAlign: 'right', borderTop: '1px solid #00ff00', paddingTop: '1cqw'}}>
                    <button onClick={onBack}
                            style={{...btnStyle, background: '#111', color: '#888', borderColor: '#444'}}>
                        EXIT_CONFIG
                    </button>
                </div>
            </div>
        </div>

    );
};