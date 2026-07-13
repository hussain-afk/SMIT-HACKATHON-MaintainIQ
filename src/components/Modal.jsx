import React from 'react';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
    // Agar modal open nahi ha to kuch bhi render nahi hoga
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B]/70 backdrop-blur-sm">
            
            {/* Modal Box Container */}
            <div className="relative w-full max-w-md bg-[#1C2541] border border-[#3A506B]/50 rounded-2xl shadow-2xl transition-all transform scale-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A506B]/40 bg-[#161F38]">
                    <h3 className="text-lg font-bold text-slate-100 tracking-wide">
                        {title || 'Notification'}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#253053] cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content Section (Dynamic Data / Forms Go Here) */}
                <div className="p-6 text-slate-300 text-sm leading-relaxed">
                    {children}
                </div>

            </div>
        </div>
    );
}

export default Modal;