// src/features/shared-menus/views/SaveSlotView.tsx
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/session/SaveDatabase';

interface SaveSlotViewProps {
    activeStateName: string;
    onSave: (slotId: number) => Promise<void>;
    onLoad: (slotId: number) => Promise<void>;
    onBack: () => void;
}

export const SaveSlotView: React.FC<SaveSlotViewProps> = ({
                                                              activeStateName,
                                                              onSave,
                                                              onLoad,
                                                              onBack
                                                          }) => {
    const saves = useLiveQuery(() => db.saves.toArray());
    const slots = [1, 2, 3];

    return (
        <div style={overlayStyle}>
            <h2 style={{ fontSize: '2.5cqw', color: '#0f0', letterSpacing: '0.2cqw' }}>
                DATA_STORAGE_INTERFACE
            </h2>

            <div style={{ display: 'flex', gap: '2cqw' }}>
                {slots.map(id => {
                    const save = saves?.find(s => s.id === id);
                    return (
                        <div key={id} style={slotCardStyle}>
                            <div style={{ color: '#888', fontSize: '0.8cqw' }}>SLOT_0{id}</div>

                            <div style={{ margin: '1.5cqw 0', height: '4cqw', borderBottom: '1px solid #222' }}>
                                {save ? (
                                    <>
                                        <div style={{ color: '#fff', fontSize: '1.1cqw' }}>{save.stateName}</div>
                                        <div style={{ color: '#444', fontSize: '0.7cqw', marginTop: '0.4cqw' }}>
                                            {new Date(save.timestamp).toLocaleString()}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ color: '#333', fontSize: '0.9cqw' }}>--- EMPTY_SECTOR ---</div>
                                )}
                            </div>

                            <button onClick={() => onSave(id)} style={btnStyle('#27ae60')}>
                                OVERWRITE
                            </button>

                            {save && (
                                <button onClick={() => onLoad(id)} style={btnStyle('#2980b9')}>
                                    RESTORE
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <button onClick={onBack} style={{ ...btnStyle('#c0392b'), marginTop: '3cqw', width: '12cqw' }}>
                RETURN_TO_SYSTEM
            </button>
        </div>
    );
};

// Styles kept for consistency...
const overlayStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.95)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'monospace', zIndex: 3000
};

const slotCardStyle: React.CSSProperties = {
    width: '18cqw', padding: '1.5cqw', border: '1px solid #333', backgroundColor: '#0a0a0a',
    borderRadius: '0.4cqw', boxShadow: '0 0 1cqw rgba(0,0,0,0.5)'
};

const btnStyle = (bg: string): React.CSSProperties => ({
    width: '100%', padding: '0.8cqw', marginBottom: '0.5cqw', backgroundColor: bg,
    color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'monospace',
    fontWeight: 'bold', fontSize: '0.8cqw', borderRadius: '0.2cqw', transition: 'filter 0.1s'
});