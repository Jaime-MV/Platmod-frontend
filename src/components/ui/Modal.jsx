import React from 'react';

/**
 * Reusable modal wrapper component.
 * Replaces inline overlayStyle patterns across AdminDashboard.
 *
 * Props:
 *  - visible: boolean — controls show/hide
 *  - onClose: () => void — called when overlay/X clicked
 *  - title: string — modal header title
 *  - size: 'default' | 'lg' — controls modal width
 *  - titleColor: string — optional title color override
 *  - children: ReactNode — modal body content
 */

const overlayStyle = (visible) => ({
    position: 'fixed',
    inset: 0,
    background: visible ? 'rgba(0,0,0,0.5)' : 'transparent',
    backdropFilter: visible ? 'blur(4px)' : 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: visible ? 9999 : -1,
    padding: '20px',
    pointerEvents: visible ? 'all' : 'none',
    visibility: visible ? 'visible' : 'hidden',
});

const Modal = ({ visible, onClose, title, size = 'default', titleColor, children }) => {
    return (
        <div style={overlayStyle(visible)}>
            <div className={`modal-content ${size === 'lg' ? 'modal-lg' : ''}`}>
                <div className="modal-header">
                    <h3 style={titleColor ? { color: titleColor } : undefined}>{title}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
