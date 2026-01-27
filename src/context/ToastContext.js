import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id} 
                        className={`pointer-events-auto flex items-center justify-between p-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 fade-in duration-300
                        ${toast.type === 'success' ? 'bg-green-900/80 border-green-500/50 text-green-100' : 
                          toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-100' : 
                          'bg-gray-900/80 border-white/20 text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === 'success' && <CheckCircle size={18} className="text-green-400" />}
                            {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
                            {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
                            <span className="text-xs font-bold">{toast.message}</span>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);