import React from 'react';

function LoadingSpinner({ message = 'Loading System Core...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 gap-6 text-slate-300 relative overflow-hidden">
      
      {/* 1. Futuristic Glowing Aura Background */}
      <div className="absolute w-48 h-48 rounded-full bg-[#4CC9F0]/5 blur-3xl animate-pulse" />
      <div className="absolute w-32 h-32 rounded-full bg-[#4361EE]/5 blur-2xl animate-pulse delay-75" />

      {/* 2. Double-Orbital Spinning Ring Structure */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer Tech Ring (Spins Clockwise) */}
        <div className="absolute inset-0 rounded-full border-2 border-t-[#4CC9F0] border-r-transparent border-b-[#4CC9F0]/20 border-l-transparent animate-spin duration-1000" />
        
        {/* Middle Speed Ring (Spins Counter-Clockwise) */}
        <div className="absolute w-12 h-12 rounded-full border border-t-[#4361EE] border-r-transparent border-b-transparent border-l-[#4361EE] animate-spin [animation-direction:reverse] duration-700" />
        
        {/* Inner Core Pulsing Dot */}
        <div className="absolute w-3.5 h-3.5 bg-gradient-to-tr from-[#4CC9F0] to-[#4361EE] rounded-full animate-ping opacity-75" />
        <div className="absolute w-2.5 h-2.5 bg-[#4CC9F0] rounded-full shadow-[0_0_12px_#4CC9F0]" />
      </div>

      {/* 3. Status Information Text */}
      <div className="text-center space-y-1.5 relative z-10">
        <h3 className="text-sm font-extrabold tracking-widest uppercase bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
          {message}
        </h3>
        
        {/* Animated small status subtext */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Synchronizing
          </span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-[#4CC9F0] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-1 bg-[#4CC9F0] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-1 bg-[#4CC9F0] rounded-full animate-bounce" />
          </span>
        </div>
      </div>

    </div>
  );
}

export default LoadingSpinner;