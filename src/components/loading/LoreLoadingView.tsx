import React from "react";

interface LoreLoadingViewProps {
    message: string;
    isFinished: boolean;
    onTransitionComplete: () => void;
}

export const LoreLoadingView: React.FC<LoreLoadingViewProps> = ({
                                                                    message,
                                                                    isFinished,
                                                                    onTransitionComplete
                                                                }) => {
    return (
        <div style={{
            width: '100%', height: '100%', background: '#111', color: '#ccc',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', padding: '20px', boxSizing: 'border-box'
        }}>

            <div style={{
                maxWidth: '600px',
                textAlign: 'center',
                lineHeight: '1.8',
                fontSize: '1.2rem',
                borderLeft: '2px solid #e74c3c',
                paddingLeft: '20px'
            }}>
                {message}
            </div>

            <div style={{ marginTop: '40px', height: '50px' }}>
                {isFinished ? (
                    <button
                        onClick={onTransitionComplete}
                        style={{
                            padding: '12px 40px',
                            background: '#e74c3c',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                        }}
                    >
                        Start
                    </button>
                ) : (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>
                        LOADING...
                    </div>
                )}
            </div>
        </div>
    );
};