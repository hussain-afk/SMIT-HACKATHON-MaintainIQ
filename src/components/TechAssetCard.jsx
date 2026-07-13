import React from 'react';
import { Shield, Hammer, HardDrive, Truck, AlertTriangle, CheckCircle, Wrench, Tag } from 'lucide-react';

function TechAssetCard({ asset }) {
  const { id, assetName, assetCategory, serialNumber, status = 'active' } = asset;

  // Icon selector based on asset category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'machinery':
        return <Hammer size={18} className="text-[#4CC9F0]" />;
      case 'facilities':
        return <Shield size={18} className="text-[#4361EE]" />;
      case 'fleet':
        return <Truck size={18} className="text-[#5F5AA2]" />;
      case 'it':
        return <HardDrive size={18} className="text-[#4CC9F0]" />;
      default:
        return <HardDrive size={18} className="text-slate-400" />;
    }
  };

  // Status configuration tailored for field work states
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'active':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: <CheckCircle size={12} className="text-emerald-400" />,
          text: 'Ready for Use'
        };
      case 'maintenance':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse',
          icon: <Wrench size={12} className="text-amber-400" />,
          text: 'Under Repair'
        };
      case 'inactive':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: <AlertTriangle size={12} className="text-rose-400" />,
          text: 'Out of Order'
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
          icon: <CheckCircle size={12} className="text-slate-400" />,
          text: 'Unknown State'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="bg-[#1C2541]/40 backdrop-blur-md border border-[#3A506B]/30 p-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 hover:border-[#3A506B]/60 group">
      
      {/* Top Section: Category & Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0B132B]/90 border border-[#3A506B]/30 rounded-lg text-slate-300">
            {getCategoryIcon(assetCategory)}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {assetCategory || 'General'}
            </span>
            <h3 className="font-bold text-slate-200 text-sm group-hover:text-[#4CC9F0] transition-colors line-clamp-1">
              {assetName || 'Unnamed Asset'}
            </h3>
          </div>
        </div>

        {/* Status Pills */}
        <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wide ${statusConfig.bg}`}>
          {statusConfig.icon}
          {statusConfig.text}
        </div>
      </div>

      {/* Middle Section: Technical Identifiers */}
      <div className="bg-[#0B132B]/40 border border-[#3A506B]/20 rounded-lg p-3 my-4 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Tag size={12} className="text-slate-500" />
            <span>Serial Reference</span>
          </div>
          <code className="text-[#4CC9F0] font-mono text-[11px] bg-[#0B132B]/60 px-1.5 py-0.5 rounded border border-[#3A506B]/30">
            {serialNumber || 'N/A'}
          </code>
        </div>
      </div>

      {/* Action Zone: Contextual buttons based on condition status */}
      <div className="mt-4 pt-1">
        {status === 'maintenance' ? (
          <button 
            onClick={() => console.log('Complete inspection for item', id)}
            className="w-full py-2 bg-linear-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-600 border border-amber-500/40 hover:border-transparent text-amber-300 hover:text-white font-semibold rounded-lg text-xs tracking-wide transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <Wrench size={14} />
            Complete Task Details
          </button>
        ) : (
          <button 
            onClick={() => console.log('Report problem workflow initialized for ID:', id)}
            className="w-full py-2 bg-[#0B132B]/80 border border-rose-500/20 text-rose-400 font-semibold rounded-lg text-xs tracking-wide hover:bg-rose-500/10 hover:border-rose-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <AlertTriangle size={14} />
            Report Fault / Issue
          </button>
        )}
      </div>

    </div>
  );
}

export default TechAssetCard;