// src/features/shared-menus/views/SaveSlotView.tsx
import React, {useRef, useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {SAVE_EXTENSION} from '../../../core/managers/SaveManager';
import {db} from '../../../core/session/SaveDatabase';

interface SaveSlotViewProps {
    activeStateName: string;
    onSave: (name: string) => Promise<void>;
    onLoad: (name: string) => Promise<void>;
    onDelete: (name: string) => Promise<void>;
    onExport: (name: string) => Promise<void>;
    onImport: (file: File) => Promise<void>;
    onBack: () => void;
}

export const SaveSlotView: React.FC<SaveSlotViewProps> = ({
                                                              activeStateName,
                                                              onSave,
                                                              onLoad,
                                                              onDelete,
                                                              onExport,
                                                              onImport,
                                                              onBack
                                                          }) => {
    const saves = useLiveQuery(() => db.saves.orderBy('timestamp').reverse().toArray());
    const [inputName, setInputName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewSave = () => {
        if (!inputName.trim()) return;
        onSave(inputName.trim());
        setInputName('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImport(e.target.files[0]);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={overlayStyle}>
                <h2 style={headerStyle}>DATA_STORAGE_INTERFACE</h2>

                {/* --- Control Bar: Create New & Import --- */}
                <div style={controlBarStyle}>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="ENTER_SAVE_NAME..."
                        style={inputStyle}
                        onKeyDown={(e) => e.key === 'Enter' && handleNewSave()}
                    />
                    <button onClick={handleNewSave} style={actionBtnStyle('#27ae60')}>
                        SAVE_NEW
                    </button>
                    <div style={{width: '2cqw'}}></div>
                    {/* Spacer */}
                    <button onClick={() => fileInputRef.current?.click()} style={actionBtnStyle('#8e44ad')}>
                        IMPORT_FILE
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        accept={SAVE_EXTENSION}
                        onChange={handleFileChange}
                    />
                </div>

                {/* --- Scrollable List of Saves --- */}
                <div style={listContainerStyle}>
                    {!saves || saves.length === 0 ? (
                        <div style={{color: '#555', marginTop: '2cqw'}}>NO_DATA_FOUND</div>
                    ) : (
                        saves.map(save => (
                            <div key={save.saveName} style={rowStyle}>
                                <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                                    <span style={{color: '#fff', fontSize: '1.2cqw', fontWeight: 'bold'}}>
                                        {save.saveName}
                                    </span>
                                    <span style={{color: '#888', fontSize: '0.8cqw'}}>
                                        {save.stateName} | {new Date(save.timestamp).toLocaleString()}
                                    </span>
                                </div>

                                <div style={{display: 'flex', gap: '0.5cqw'}}>
                                    <button onClick={() => onSave(save.saveName)} style={smBtnStyle('#27ae60')}>
                                        OVERWRITE
                                    </button>
                                    <button onClick={() => onLoad(save.saveName)} style={smBtnStyle('#2980b9')}>
                                        LOAD
                                    </button>
                                    <button onClick={() => onExport(save.saveName)} style={smBtnStyle('#d35400')}>
                                        EXPORT
                                    </button>
                                    <button onClick={() => onDelete(save.saveName)} style={smBtnStyle('#c0392b')}>
                                        DEL
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button onClick={onBack} style={backBtnStyle}>
                    RETURN_TO_SYSTEM
                </button>
            </div>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const overlayStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%', height: '100%',
    maxWidth: 'calc(100vh * (16 / 9))', maxHeight: 'calc(100vw * (9 / 16))',
    aspectRatio: '16 / 9',
    backgroundColor: 'rgba(5, 5, 5, 0.95)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '2cqw',
    fontFamily: 'monospace', zIndex: 3000,
    containerType: 'size'
};

const headerStyle: React.CSSProperties = {
    fontSize: '2.5cqw', color: '#0f0', letterSpacing: '0.2cqw', marginBottom: '1.5cqw'
};

const controlBarStyle: React.CSSProperties = {
    display: 'flex', width: '80%', gap: '1cqw', marginBottom: '1.5cqw'
};

const listContainerStyle: React.CSSProperties = {
    flex: 1, width: '80%', overflowY: 'auto',
    border: '1px solid #333', padding: '1cqw', backgroundColor: '#0a0a0a',
    display: 'flex', flexDirection: 'column', gap: '0.5cqw'
};

const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111', padding: '1cqw', borderRadius: '0.3cqw',
    borderLeft: '0.3cqw solid #444'
};

const inputStyle: React.CSSProperties = {
    flex: 1, backgroundColor: '#222', border: '1px solid #444', color: 'white',
    padding: '0.5cqw', fontFamily: 'monospace', fontSize: '1cqw'
};

const actionBtnStyle = (bg: string): React.CSSProperties => ({
    padding: '0 1.5cqw', backgroundColor: bg, color: 'white', border: 'none',
    cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1cqw'
});

const smBtnStyle = (bg: string): React.CSSProperties => ({
    padding: '0.4cqw 0.8cqw', backgroundColor: bg, color: 'white', border: 'none',
    cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8cqw', borderRadius: '0.2cqw'
});

const backBtnStyle: React.CSSProperties = {
    marginTop: '1.5cqw', width: '15cqw', padding: '0.8cqw',
    backgroundColor: '#c0392b', color: 'white', border: 'none',
    cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1cqw'
};