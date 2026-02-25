// src/features/MainMenu/MainMenuView.tsx
import React, { useState, useEffect } from 'react';
import { MainMenuController } from './MainMenuController';

interface MainMenuViewProps {
    controller: MainMenuController;
    res?: string;
    setRes?: (r: any) => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({ controller, res, setRes }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        controller.bindView(setSelectedIndex, res, setRes);
        return () => controller.unbindView();
    }, [controller, res, setRes]);

    const menuItems = ["Start Game", "Load Game", "Options", "Legacy Menu"];

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'relative',
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                backgroundColor: '#0a0a0a', color: '#00ff00',
                boxSizing: 'border-box', fontFamily: 'monospace',
                border: '0.2cqw solid #333', display: 'flex'
            }}>

                <div style={{
                    flex: 1,
                    borderRight: '0.2cqw solid #333',
                    padding: '3cqw',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', gap: '1.5cqw',
                    backgroundColor: '#050505'
                }}>
                    {menuItems.map((label, idx) => (
                        <button
                            key={idx}
                            onMouseEnter={() => controller.setHoverIndex(idx)}
                            onClick={() => controller.executeSelected()}
                            style={{
                                padding: '1.2cqw',
                                backgroundColor: selectedIndex === idx ? '#00ff00' : '#111',
                                color: selectedIndex === idx ? '#000' : '#888',
                                border: selectedIndex === idx ? '0.1cqw solid #fff' : '0.1cqw solid #333',
                                borderRadius: '0.4cqw',
                                cursor: 'pointer',
                                fontSize: '1cqw', fontWeight: 'bold',
                                textAlign: 'left', textTransform: 'uppercase',
                                transition: 'all 0.1s ease-in-out'
                            }}
                        >
                            {selectedIndex === idx ? `> ${label}` : label}
                        </button>
                    ))}
                </div>

                <div style={{
                    flex: 3,
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <div style={{ opacity: 0.2, fontSize: '2cqw', color: '#00ff00', fontStyle: 'italic' }}>
                        [ *TBD* ]
                    </div>
                </div>

            </div>
        </div>
    );
};