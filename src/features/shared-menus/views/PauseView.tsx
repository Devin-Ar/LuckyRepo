// src/features/shared-menus/views/PauseView.tsx
import React from 'react';

interface PauseViewProps {
    onResume: () => void;
    onSaveMenu: () => void;
    onSettings: () => void;
    onQuit: () => void;
}

export const PauseView: React.FC<PauseViewProps> = ({ onResume, onSaveMenu, onSettings, onQuit }) => {
    const buttonBaseStyle: React.CSSProperties = {
        padding: '1.2cqw 3cqw',
        fontSize: '1.2cqw',
        cursor: 'pointer',
        marginBottom: '1cqw',
        color: 'white',
        border: 'none',
        fontWeight: 'bold',
        borderRadius: '0.4cqw',
        width: '28cqw',
        fontFamily: 'monospace'
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        fontFamily: 'monospace',
        userSelect: 'none'
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '6cqw', marginBottom: '2cqw', letterSpacing: '0.5cqw' }}>
                PAUSED
            </h1>

            <button
                onClick={onResume}
                style={{ ...buttonBaseStyle, fontSize: '1.5cqw', backgroundColor: '#27ae60' }}
            >
                RESUME
            </button>

            <button
                onClick={onSaveMenu}
                style={{ ...buttonBaseStyle, backgroundColor: '#8e44ad' }}
            >
                SAVE / LOAD GAME
            </button>

            <button
                onClick={onSettings}
                style={{ ...buttonBaseStyle, backgroundColor: '#7f8c8d' }}
            >
                SYSTEM SETTINGS
            </button>

            <button
                onClick={onQuit}
                style={{ ...buttonBaseStyle, backgroundColor: '#c0392b' }}
            >
                QUIT TO SWITCHBOARD
            </button>
        </div>
    );
};