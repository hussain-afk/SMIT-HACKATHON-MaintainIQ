import React, { useState } from 'react';
import { Shield, Hammer, HardDrive, Truck, Clock, Tag, Trash2, ChevronDown } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeAsset, addAsset } from '../redux/reducers/assetSlice'; 
import { db, deleteDoc, doc, updateDoc } from '../config/firebase'; 
import { QRCodeSVG } from 'qrcode.react'; // QR Code Library Imported

function AdminAssetCard({ asset }) {
  const { id, assetName, assetCategory, serialNumber, createdAt, status = 'active', description, notes } = asset;
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);

  // Dynamic link generation for technician view based on current domain environment
  const assetUrl = `${window.location.origin}/tech/asset/${id}`;
  console.log(`Generated Asset URL for QR Code: ${assetUrl}`);

  // Color-coded text and boundary styling based on current status value
  const getStatusColorClass = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'maintenance':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'inactive':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

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

  // Helper to format ISO string to a clean date layout
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle Dropdown Status Change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    try {
      const assetDocRef = doc(db, 'assets', id);
      await updateDoc(assetDocRef, { status: newStatus });
      dispatch(addAsset({ ...asset, status: newStatus }));
      console.log(`Asset ${id} status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating asset status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle asset deletion from Firebase Firestore & Redux Store
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${assetName || 'this asset'}?`)) {
      try {
        const assetDocRef = doc(db, 'assets', id);
        await deleteDoc(assetDocRef);
        dispatch(removeAsset(id));
      } catch (error) {
        console.error('Error deleting asset document:', error);
      }
    }
  };

  return (
    <div className="bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-5 rounded-2xl shadow-xl transition-all hover:border-[#4CC9F0]/50 group flex flex-col justify-between">
      
      <div>
        {/* Header Info & QR Code Row */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0B132B]/80 border border-[#3A506B]/40 rounded-xl group-hover:border-[#4CC9F0]/30 transition-colors">
              {getCategoryIcon(assetCategory)}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 group-hover:text-[#4CC9F0] transition-colors text-base line-clamp-1">
                {assetName || 'Unnamed Asset'}
              </h3>
              <span className="text-xs text-slate-400 capitalize tracking-wide">
                {assetCategory || 'Uncategorized'}
              </span>
            </div>
          </div>

          {/* 🖨️ QR Code Card Container Block */}
          <div className="p-1.5 bg-white rounded-xl border border-[#3A506B]/30 shadow-md shrink-0 relative group/qr">
            <QRCodeSVG 
              value={assetUrl} 
              size={56} 
              bgColor={"#ffffff"}
              fgColor={"#0B132B"}
              level={"M"}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-[9px] text-slate-300 px-2 py-0.5 rounded opacity-0 group-hover/qr:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#3A506B]/40">
              Scan View Path
            </div>
          </div>
        </div>

        {/* Dropdown Status Selector */}
        <div className="relative flex items-center mb-4">
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={isUpdating}
            className={`w-full text-xs font-extrabold tracking-wider uppercase pl-3 pr-8 py-2 border rounded-xl appearance-none cursor-pointer outline-none transition-all focus:border-[#4CC9F0] disabled:opacity-50 ${getStatusColorClass(status)}`}
          >
            <option value="active" className="bg-[#1C2541] text-emerald-400 font-bold">Active / Functional</option>
            <option value="maintenance" className="bg-[#1C2541] text-amber-400 font-bold">Under Maintenance</option>
            <option value="inactive" className="bg-[#1C2541] text-rose-400 font-bold">Inactive / Offline</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 pointer-events-none text-slate-400" />
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

          {/* Progress State Parameter Display */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3A506B]/20">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Progress State</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
              status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              status === 'maintenance' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {status === 'active' ? 'Operational' : status === 'maintenance' ? 'In Progress' : 'Fault Alert'}
            </span>
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
          onClick={handleDelete}
          className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          title="Delete System Element"
        >
          <Trash2 size={14} />
          Remove System Node
        </button>
      </div>

    </div>
  );
}

export default AdminAssetCard;