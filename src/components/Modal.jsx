import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// A reusable pop-up box. Give it isOpen, onClose, a title, and whatever
// content you want to show inside it (children).
function Modal({ isOpen, onClose, title, children }) {

    // ENHANCEMENT: let people press the "Escape" key to close the modal.
    // This is a small thing but it makes the app feel much more polished.
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // If modal is closed, render nothing at all.
    if (!isOpen) return null;

    return (
        // ENHANCEMENT: clicking the dark background now also closes the modal
        // (a very common, expected behavior). Clicking inside the box does not.
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B]/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-[#1C2541] border border-[#3A506B]/50 rounded-2xl shadow-2xl transition-all transform scale-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
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
