import React, { useEffect, useState, useContext } from 'react';
import { db, collection, getDocs, addDoc, signOut, auth, doc, updateDoc, deleteDoc } from '../../config/firebase';
import AdminAssetCard from '../../components/adminCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShieldCheck, Search, LayoutGrid, Wrench, AlertCircle, LogOut, Plus, PackageOpen, UserCheck, Check, X, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/Store';
import Modal from '../../components/Modal';

function AdminDashboard() {
  const navigate = useNavigate();
  const { setUser, photoURL } = useContext(StoreContext);

  // --- States ---
  const [assets, setAssets] = useState([]);
  const [handoverRequests, setHandoverRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    assetCategory: 'machinery',
    serialNumber: '',
    description: '',
  });

  // --- 1. Load Data from Firebase ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch Assets
      const assetsSnapshot = await getDocs(collection(db, "assets"));
      const assetsList = [];
      assetsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        assetsList.push({ id: doc.id, ...data });
      });
      setAssets(assetsList);
      console.log("Assets loaded:", assetsList);
      console.log(assets);

      // Fetch Handover Requests
      const requestsSnapshot = await getDocs(collection(db, "handover_requests"));
      const reqList = [];
      requestsSnapshot.forEach((doc) => {
        reqList.push({ id: doc.id, ...doc.data() });
      });
      setHandoverRequests(reqList);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleDocsModalOpen(); // Automatically open the docs modal on first load
  }, []);


  function handleDocsModalOpen() {
    setIsDocsModalOpen(true);
  }

  // --- 2. Approve Handover ---
  const handleApproveRequest = async (request) => {
    try {
      // 1. Firebase mein status update karein
      const assetRef = doc(db, "assets", request.assetId);
      await updateDoc(assetRef, { status: "maintenance" });

      // 2. Local State update karein (Redux ke bina)
      setAssets(prev => prev.map(asset =>
        asset.id === request.assetId ? { ...asset, status: "maintenance" } : asset
      ));

      // 3. Request delete Method
      await deleteDoc(doc(db, "handover_requests", request.id));
      setHandoverRequests(prev => prev.filter(r => r.id !== request.id));

      alert("Handover Request Approved!");
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  // --- 3. Reject Handover ---
  const handleRejectRequest = async (request) => {
    try {
      // 1. Status ko active par wapas set karein
      const assetRef = doc(db, "assets", request.assetId);
      await updateDoc(assetRef, { status: "active" });

      // 2. Local State update karein
      setAssets(prev => prev.map(asset =>
        asset.id === request.assetId ? { ...asset, status: "active" } : asset
      ));

      // 3. Request list se delete karein
      await deleteDoc(doc(db, "handover_requests", request.id));
      setHandoverRequests(prev => prev.filter(r => r.id !== request.id));

      alert("Handover Request Rejected.");
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  // --- 4. Add New Asset ---
  const handleAddAsset = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newAsset.assetName.trim() || !newAsset.serialNumber.trim()) {
      setFormError('Please fill in asset name and serial number.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...newAsset,
        status: 'active',
        notes: '',
        createdAt: new Date().toISOString(),
      };

      // Firebase mein add karein
      const docRef = await addDoc(collection(db, 'assets'), payload);

      // State mein direct add karein
      setAssets(prev => [...prev, { id: docRef.id, ...payload }]);

      // Form reset aur modal close
      setNewAsset({ assetName: '', assetCategory: 'machinery', serialNumber: '', description: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding asset:', error);
      setFormError('Could not save asset. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      // Adding a tiny delay so the spin animation feels satisfying to the user
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // --- Search & Metrics Calculations ---
  const filteredAssets = assets.filter(asset =>
    asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.assetCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = assets.length;
  const maintenanceCount = assets.filter(a => a.status?.toLowerCase() === 'maintenance').length;
  const faultCount = assets.filter(a => a.status?.toLowerCase() === 'inactive').length;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#3A506B]/30 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#4CC9F0]">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Admin Portal</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight mt-1">Asset Control Center</h1>
          </div>


          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1C2541]/40 border border-[#3A506B]/50 rounded-xl text-slate-200 text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4361EE] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Asset
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl text-slate-400 hover:text-rose-400 cursor-pointer transition-all duration-300 group shadow-md"
            >
              {/* Profile Image with subtle border */}
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-slate-700 group-hover:border-rose-500/40 transition-colors"
                />
              ) : (
                // Fallback if photo is not available
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-[#4CC9F0]">
                  U
                </div>
              )}

              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-300 group-hover:text-rose-300 transition-colors">Sign Out</span>
                <span className="text-[10px] text-slate-500">Active Session</span>
              </div>

              <LogOut size={16} className="ml-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Metrics Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-[#0B132B] text-[#4CC9F0] rounded-xl"><LayoutGrid size={18} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Registry</p>
              <h3 className="text-xl font-bold">{totalCount} Assets</h3>
            </div>
          </div>

          <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-[#0B132B] text-amber-400 rounded-xl"><Wrench size={18} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Under Maintenance</p>
              <h3 className="text-xl font-bold text-amber-400">{maintenanceCount}</h3>
            </div>
          </div>

          <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-[#0B132B] text-rose-400 rounded-xl"><AlertCircle size={18} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Fault Alerts</p>
              <h3 className="text-xl font-bold text-rose-400">{faultCount}</h3>
            </div>
          </div>
        </div>

        {/* Handover Requests Display Area */}
        <div className="space-y-4">

          {/* request handler and refresh button  */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-800/60 mb-6">

            {/* Left Side: Title & Dynamic Pulse Badge */}
            <div className="flex items-center gap-3">
              {/* Icon Wrapper with subtle background glow */}
              <div className="p-2.5 bg-[#4CC9F0]/10 border border-[#4CC9F0]/20 text-[#4CC9F0] rounded-xl shadow-[0_0_15px_rgba(76,201,240,0.05)]">
                <UserCheck size={18} className="animate-pulse" />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                    Pending Handover Requests
                  </h2>
                  {/* Pulsing Count Indicator */}
                  {handoverRequests.length > 0 && (
                    <span className="relative flex h-5 px-2 items-center justify-center rounded-full bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-[10px] font-black text-white shadow-[0_0_10px_rgba(76,201,240,0.3)]">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#4CC9F0] opacity-40 animate-ping" />
                      <span className="relative">{handoverRequests.length}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Needs Immediate Authorization
                </p>
              </div>
            </div>

            {/* Right Side: Interactive Glass Refresh Button */}
            <div className="self-end sm:self-auto">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-800/80 disabled:bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white cursor-pointer active:scale-95 disabled:pointer-events-none transition-all duration-200 group shadow-lg"
              >
                <RotateCw
                  size={14}
                  className={`text-[#4CC9F0] group-hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-45'
                    } transition-transform duration-300`}
                />
                <span>{isRefreshing ? 'Syncing...' : 'Refresh All Data'}</span>
              </button>
            </div>

          </div>
          {/* request handler and refresh button  +++++++== end ===++++++  */}
          {handoverRequests.length === 0 ? (
            <div className="p-4 bg-[#1C2541]/10 border border-dashed border-[#3A506B]/30 rounded-2xl text-center text-xs text-slate-500">
              No pending tech handover requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {handoverRequests.map((req) => (
                <div key={req.id} className="bg-[#1C2541]/40 border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-100 text-sm">{req.assetName}</h4>
                      <span className="text-[10px] font-mono text-slate-500">SN: {req.serialNumber}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Requested By: <strong className="text-slate-200">{req.techName}</strong></p>
                    <p className="text-xs text-slate-400">Est. Duration: <strong className="text-slate-200">{req.estimatedTime}</strong></p>
                    <div className="bg-[#0B132B]/50 p-2 rounded-lg text-[11px] text-slate-300 italic mt-2">
                      "{req.notes}"
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-[#3A506B]/20 pt-3">
                    <button
                      onClick={() => handleApproveRequest(req)}
                      className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check size={12} /> Approve Handover
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req)}
                      className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg flex items-center justify-center cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Asset Grid */}
        <div className="space-y-4 pt-4 border-t border-[#3A506B]/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Registered Asset Grid</h2>
          {isLoading ? (
            <LoadingSpinner message="Loading asset registry..." />
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#3A506B]/20 rounded-2xl bg-[#1C2541]/10">
              <PackageOpen size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No assets found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <AdminAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Simplified Inline Modal for Add Asset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C2541] border border-[#3A506B]/50 rounded-2xl p-6 w-full max-w-md space-y-4 relative">
            <button
              onClick={() => { setIsAddModalOpen(false); setFormError(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-100">Register New Asset</h3>

            <form onSubmit={handleAddAsset} className="space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Forklift Unit 4"
                  value={newAsset.assetName}
                  onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B132B] border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Category</label>
                <select
                  value={newAsset.assetCategory}
                  onChange={(e) => setNewAsset({ ...newAsset, assetCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B132B] border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm outline-none"
                >
                  <option value="machinery">Machinery</option>
                  <option value="facilities">Facilities</option>
                  <option value="fleet">Fleet</option>
                  <option value="it">IT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. SN-2049-A"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B132B] border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short note..."
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B132B] border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-[#4361EE] hover:bg-[#3b55d9] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Asset to Registry'}
              </button>
            </form>
          </div>
        </div>
      )}
      <Modal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        title="MaintainIQ Field Handbook"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Welcome to the MaintainIQ Field Handbook! This guide provides technicians and operators with essential workflows, safety protocols, and best practices for managing assets in the field. Please refer to this handbook whenever you need guidance on asset handling, maintenance procedures, or reporting issues.
          </p>
          <p className="text-sm text-slate-300">
            For detailed instructions, diagrams, and troubleshooting tips, please visit our online documentation at <a href="/docs" className="text-[#4CC9F0] underline">MaintainIQ Docs</a>.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;