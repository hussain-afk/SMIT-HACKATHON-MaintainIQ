import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Modal from '../components/Modal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  Search,
  Package,
  MapPin,
  Hash,
  Tag,
  Copy,
  Check,
  Filter,
  QrCode,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES = ['Electronics', 'Machinery', 'Furniture', 'Vehicles', 'HVAC', 'Plumbing', 'Other'];
const STATUS_OPTIONS = ['Active', 'Maintenance', 'Decommissioned'];

function AssetCard({ asset }) {
  const [copied, setCopied] = useState(false);

  const statusColors = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Decommissioned: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(asset.qrCodeUrl || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-${asset.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Asset_QR_${asset.serialNumber}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-5 hover:border-[#4CC9F0]/30 transition-all duration-300 group hover:shadow-lg hover:shadow-[#4CC9F0]/5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4CC9F0]/20 to-[#4361EE]/20 flex items-center justify-center">
          <Package size={20} className="text-[#4CC9F0]" />
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            statusColors[asset.status] || statusColors.Active
          }`}
        >
          {asset.status || 'Active'}
        </span>
      </div>

      <h3 className="text-white font-semibold text-base mb-2 group-hover:text-[#4CC9F0] transition-colors">
        {asset.name}
      </h3>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Tag size={14} className="text-gray-500" />
          <span>{asset.category || 'Uncategorized'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Hash size={14} className="text-gray-500" />
          <span className="font-mono text-xs">{asset.serialNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin size={14} className="text-gray-500" />
          <span>{asset.location}</span>
        </div>
        {asset.nextMaintenanceDate && (
          <div className="flex items-center gap-2 text-sm text-[#FFA62B]/80 pt-1">
            <QrCode size={14} />
            <span>Next Maint: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {asset.qrCodeUrl && (
        <div className="flex justify-center mb-4 p-2 bg-white/5 rounded-xl border border-[#3A506B]/30">
          <QRCodeSVG 
            id={`qr-${asset.id}`} 
            value={asset.qrCodeUrl} 
            size={80} 
            level="L" 
            includeMargin={true}
          />
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-[#3A506B]/30">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-[#4CC9F0]/10 text-[#4CC9F0] hover:bg-[#4CC9F0]/20 transition-all duration-200"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        {asset.qrCodeUrl && (
          <button
            onClick={handleDownloadQR}
            title="Download QR Code"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#4361EE]/10 text-[#4361EE] hover:bg-[#4361EE]/20 transition-all duration-200"
          >
            <QrCode size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    serialNumber: '',
    location: '',
    status: 'Active',
    nextMaintenanceDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'assets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'assets'), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      const qrCodeUrl = `${window.location.origin}/public/asset/${docRef.id}`;

      // Update the doc with the generated public URL
      const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
      await updateDoc(firestoreDoc(db, 'assets', docRef.id), { qrCodeUrl });

      // Log the activity
      await addDoc(collection(db, 'activityLog'), {
        action: `New asset "${formData.name}" registered in ${formData.location}`,
        type: 'asset',
        timestamp: serverTimestamp(),
      });

      setFormData({ name: '', category: 'Electronics', serialNumber: '', location: '', status: 'Active', nextMaintenanceDate: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to register asset:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const inputClasses =
    'w-full px-4 py-2.5 rounded-xl bg-[#0B132B]/80 border border-[#3A506B]/50 text-white placeholder-gray-500 focus:outline-none focus:border-[#4CC9F0]/60 focus:ring-1 focus:ring-[#4CC9F0]/30 transition-all duration-200 text-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Asset Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            {assets.length} total assets registered
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white text-sm font-semibold shadow-lg shadow-[#4CC9F0]/20 hover:shadow-[#4CC9F0]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus size={18} />
          Register Asset
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search assets by name, serial, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClasses} pl-10`}
          />
        </div>
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${inputClasses} w-auto min-w-[140px] cursor-pointer`}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputClasses} w-auto min-w-[130px] cursor-pointer`}
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 py-16 text-center">
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No assets found</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All'
              ? 'Try adjusting your filters.'
              : 'Register your first asset to get started.'}
          </p>
        </div>
      )}

      {/* Registration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Asset Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., HP ProBook 450"
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`${inputClasses} cursor-pointer`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`${inputClasses} cursor-pointer`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Serial Number</label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleInputChange}
              required
              placeholder="e.g., SN-2024-00158"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="e.g., Building A, Floor 3"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Next Maintenance Date <span className="text-gray-500 font-normal">(optional)</span></label>
            <input
              type="date"
              name="nextMaintenanceDate"
              value={formData.nextMaintenanceDate}
              onChange={handleInputChange}
              className={inputClasses}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#3A506B]/50 text-gray-400 text-sm font-medium hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white text-sm font-semibold shadow-lg shadow-[#4CC9F0]/20 hover:shadow-[#4CC9F0]/40 disabled:opacity-60 transition-all duration-200"
            >
              {submitting ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
