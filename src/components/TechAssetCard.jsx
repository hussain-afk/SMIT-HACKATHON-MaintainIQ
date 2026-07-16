import React from 'react';
import { Shield, Hammer, HardDrive, Truck, AlertTriangle, CheckCircle, Wrench, Tag, QrCode } from 'lucide-react';
import Modal from './Modal';
import { QRCodeSVG } from 'qrcode.react';
import { NavLink } from 'react-router-dom';

// This card shows ONE asset, the way a technician (field worker) sees it.
// It is "read mostly" - technicians click it to go see full details.
function TechAssetCard({ asset }) {
  // console.log('Rendering TechAssetCard for asset:', asset);


  const { assetName, assetCategory, serialNumber, status = 'opentowork', id } = asset;

  const assetUrl = `${window.location.origin}/tech/asset/${id}`;
  // console.log('Asset URL:', assetUrl);


  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);

  // Pick a small icon based on what kind of asset this is.
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

  // One single source of truth for "how does this status look" - the
  // accent bar, the pill, and the bottom hint all read from this, so they
  // can never disagree with each other.
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'active':
        return {
          accent: 'bg-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: <CheckCircle size={12} className="text-emerald-400" />,
          text: 'Ready for Use',
        };
      case 'opentowork':
        return {
          accent: 'bg-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          icon: <Hammer size={12} className="text-blue-400" />,
          text: 'Open to Work',
      }
      case 'pending_approval':
      case 'maintenance':
        return {
          accent: 'bg-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse',
          icon: <Wrench size={12} className="text-amber-400" />,
          text: 'Under Repair',
        };
      case 'inactive':
        return {
          accent: 'bg-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: <AlertTriangle size={12} className="text-rose-400" />,
          text: 'Out of Order',
        };
      default:
        return {
          accent: 'bg-slate-400',
          bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
          icon: <CheckCircle size={12} className="text-slate-400" />,
          text: 'Unknown State',
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <>
      <div className="relative bg-[#1C2541]/40 backdrop-blur-md border border-[#3A506B]/30 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4CC9F0]/40 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)] group h-full overflow-hidden">

        {/* Colored strip on top - matches the status, same visual language as
          the admin card, so both portals feel like one product. */}
        <div className={`h-1 w-full ${statusConfig.accent}`} />

        <div className="p-5">
          {/* Top Section: Category & Status */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-[#0B132B]/90 border border-[#3A506B]/30 rounded-lg text-slate-300 shrink-0">
                {getCategoryIcon(assetCategory)}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {assetCategory || 'General'}
                </span>
                <h3 className="font-bold text-slate-200 text-sm group-hover:text-[#4CC9F0] transition-colors line-clamp-1">
                  {assetName || 'Unnamed Asset'}
                </h3>
              </div>
            </div>

            {/* NEW: the QR icon now lives here as a small, tidy badge next to
              the status pill, instead of an oddly-placed icon at the
              bottom. It just signals "this asset has a QR tag" - since the
              whole card is already a tappable link, it isn't a button. */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                title="This asset has a QR tag"
                className="p-1.5 bg-[#0B132B]/60 border border-[#3A506B]/30 rounded-md text-slate-500"
              >
                <QrCode onClick={() => setIsQrModalOpen(true)} size={13} />
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wide ${statusConfig.bg}`}>
                {statusConfig.icon}
                {statusConfig.text}
              </div>
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

          {/* Bottom hint - the whole card is a link (see Dashboard), this is
            just a visual cue telling the technician what tapping it does. */}
          <div className="mt-4 pt-1">
            {status === 'maintenance' ? (
              <NavLink to={`/tech/asset/${id}`} className="block">
                <div className="w-full py-2 bg-linear-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-300 font-semibold rounded-lg text-xs tracking-wide flex items-center justify-center gap-2 transition-colors group-hover:border-amber-500/60">
                  <Wrench size={14} />
                  Tap to Update Repair Progress
                </div>
              </NavLink>
            ) : (
              <NavLink to={`/tech/asset/${id}`} className="block">
                <div className="cursor-pointer w-full py-2 bg-[#0B132B]/60 border border-[#3A506B]/30 text-slate-300 font-semibold rounded-lg text-xs tracking-wide flex items-center justify-center gap-2 transition-colors group-hover:border-[#4CC9F0]/50 group-hover:text-[#4CC9F0]">
                  <AlertTriangle size={14} />
                  Tap to Report a Fault / Issue
                </div>
              </NavLink>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Asset QR Code"
      >
        <div className="flex flex-col items-center justify-center p-4">
          <QRCodeSVG
            className="border border-[#3A506B]/20 rounded-xl p-2 bg-white"
            value={assetUrl}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <p className="text-xs text-slate-500 mt-3 text-center break-all">{assetUrl}</p>
        </div>
      </Modal>
    </>
  );
}

export default TechAssetCard;