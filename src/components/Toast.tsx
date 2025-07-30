import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onDismiss }) {
    if (!message) return null;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    return <div className={`toast ${type}`}>{message}</div>;
};
