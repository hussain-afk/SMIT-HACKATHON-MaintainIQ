import React, { useState } from 'react';
import {
  Shield, Hammer, HardDrive, Truck, Clock, Tag, Trash2, QrCode,
  CheckCircle2, Wrench, AlertTriangle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeAsset } from '../redux/reducers/assetSlice';
import { db, deleteDoc, doc } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';

// This card shows ONE asset, the way an ADMIN sees it.
// Admins can: VIEW status (read-only - only technicians change it out in
// the field), delete the asset, and view/print its QR code.
function AdminAssetCard({ asset }) {
  const { id, assetName, assetCategory, serialNumber, createdAt, status = 'active', description, notes } = asset;
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const assetUrl = `${window.location.origin}/tech/asset/${id}`;

  // One single source of truth for "how does this status look" - used by
  // both the accent bar and the status banner, so they can never disagree.
  const getStatusMeta = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'active':
        return {
          label: 'Active / Functional',
          subLabel: 'Operational',
          accent: 'bg-emerald-400',
          classes: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
          icon: <CheckCircle2 size={16} className="text-emerald-400" />,
        };
      case 'maintenance':
        return {
          label: 'Under Maintenance',
          subLabel: 'In Progress',
          accent: 'bg-amber-400',
          classes: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
          icon: <Wrench size={16} className="text-amber-400" />,
        };
      case 'inactive':
        return {
          label: 'Inactive / Offline',
          subLabel: 'Fault Alert',
          accent: 'bg-rose-400',
          classes: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
          icon: <AlertTriangle size={16} className="text-rose-400" />,
        };
      default:
        return {
          label: currentStatus || 'Unknown',
          subLabel: 'Unclassified',
          accent: 'bg-slate-400',
          classes: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
          icon: <Shield size={16} className="text-slate-400" />,
        };
    }
  };

  const statusMeta = getStatusMeta(status);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const assetDocRef = doc(db, 'assets', id);
      await deleteDoc(assetDocRef);
      dispatch(removeAsset(id));
    } catch (error) {
      console.error('Error deleting asset document:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="relative bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 rounded-2xl shadow-xl transition-all duration-300 hover:border-[#4CC9F0]/50 hover:shadow-[0_0_0_1px_rgba(76,201,240,0.15),0_12px_28px_-8px_rgba(0,0,0,0.5)] group flex flex-col justify-between h-full overflow-hidden">

        {/* NEW: a thin colored strip across the top so status is readable
            at a glance, even before reading any text. */}
        <div className={`h-1 w-full ${statusMeta.accent}`} />

        <div className="p-5 flex flex-col justify-between grow">
          <div>
            {/* Header Info & Action Icons Row */}
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-[#0B132B]/80 border border-[#3A506B]/40 rounded-xl group-hover:border-[#4CC9F0]/30 transition-colors shrink-0">
                  {getCategoryIcon(assetCategory)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-100 group-hover:text-[#4CC9F0] transition-colors text-base line-clamp-1">
                    {assetName || 'Unnamed Asset'}
                  </h3>
                  <span className="text-xs text-slate-400 capitalize tracking-wide">
                    {assetCategory || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* NEW: a real icon button (background + border + hover state)
                  instead of a bare floating icon. */}
              <button
                onClick={() => setIsQrModalOpen(true)}
                title="View QR Code"
                className="p-2 bg-[#0B132B]/60 border border-[#3A506B]/40 rounded-lg text-slate-400 hover:text-[#4CC9F0] hover:border-[#4CC9F0]/40 transition-colors cursor-pointer shrink-0"
              >
                <QrCode size={16} />
              </button>
            </div>

            {/* One unified, READ-ONLY status banner - combines what used to
                be two separate, slightly repetitive status blocks into a
                single clear readout. No edit control here on purpose:
                admins only VIEW status, technicians change it on-site. */}
            <div className="mb-4">
              <div className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl ${statusMeta.classes}`}>
                {statusMeta.icon}
                <div className="min-w-0">
                  <div className="text-xs font-extrabold tracking-wide uppercase truncate">
                    {statusMeta.label}
                  </div>
                  <div className="text-[10px] opacity-70 font-semibold tracking-wider uppercase">
                    {statusMeta.subLabel}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[#3A506B]/20 my-3" />

            {/* Meta details */}
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-slate-500" />
                <span className="font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Serial:</span>
                <code className="text-slate-300 font-mono bg-[#0B132B]/50 px-1.5 py-0.5 rounded border border-[#3A506B]/20">
                  {serialNumber || 'N/A'}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-500" />
                <span className="font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Registered:</span>
                <span className="text-slate-300">{formatDate(createdAt)}</span>
              </div>

              <div className="flex items-start gap-2">
                <Shield size={14} className="text-slate-500 mt-0.5" />
                <div>
                  <span className="font-semibold uppercase text-slate-500 tracking-wider text-[10px] block mb-0.5">Description:</span>
                  <span className="text-slate-300 line-clamp-2">{description || 'No description provided.'}</span>
                </div>
              </div>

              {/* Latest Live Maintenance Notes */}
              {notes && (
                <div className="text-[11px] text-slate-400 italic bg-[#0B132B]/40 p-2.5 rounded-xl mt-2 border border-[#3A506B]/10">
                  <span className="font-bold text-slate-500 not-italic block text-[9px] uppercase tracking-wider mb-0.5">
                    Latest Tech Entry:
                  </span>
                  "{notes}"
                </div>
              )}
            </div>
          </div>

          {/* Admin Action Bar Bottom Area */}
          <div className="flex gap-2 mt-5 pt-3 border-t border-[#3A506B]/10">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Delete System Element"
            >
              <Trash2 size={14} />
              Remove System Node
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: shows the big QR code so admins can print/scan it */}
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

      {/* Modal 2: a friendly "are you sure?" box instead of the browser's plain confirm() popup */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete This Asset?"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-300">
            Are you sure you want to permanently delete{' '}
            <span className="font-bold text-slate-100">{assetName || 'this asset'}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full py-2.5 bg-[#0B132B]/60 border border-[#3A506B]/50 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer hover:bg-[#0B132B]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete It'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdminAssetCard;