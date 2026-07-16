import React, { useEffect, useState, useContext, useCallback } from 'react'
import { db, collection, getDocs, signOut, auth } from '../../config/firebase'
import TechAssetCard from '../../components/TechAssetCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Wrench, Search, LayoutGrid, CheckCircle2, AlertCircle, LogOut, RotateCw, ArrowRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/Store';
import Modal from '../../components/Modal';

function Dashboard() {
  const navigate = useNavigate();
  const { setUser, photoURL } = useContext(StoreContext);

  // --- States ---
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // 🌟 New State for Button Feedback
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false); // State for Docs Modal

  // --- 1. Modular Load Assets Logic (Extracted for reuse) ---
  const loadAssets = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const querySnapshot = await getDocs(collection(db, "assets"));
      const tempAssets = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Firebase timestamp converter logic
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        tempAssets.push({ id: doc.id, ...data });
      });

      setAssets(tempAssets);
    } catch (error) {
      console.error("Tech Dashboard load error:", error);
    } finally {
      setIsLoading(false);
      // satisfying spinning feedback duration limit
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    loadAssets(true);
  }, [loadAssets]);

  function handleDocsModalOpen() {
    setIsDocsModalOpen(true);
  }
  useEffect(() => {
    handleDocsModalOpen(); // Automatically open the docs modal on first load
  }, []);

  // --- 2. Logout Function ---
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  // --- 3. Search Filtering ---
  const filteredAssets = assets.filter(asset =>
    asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.assetCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 4. Metrics Counters ---
  const totalCount = assets.length;
  const maintenanceCount = assets.filter(a => a.status?.toLowerCase() === 'maintenance').length;
  const faultCount = assets.filter(a => a.status?.toLowerCase() === 'inactive').length;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 lg:p-10 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800/60 pb-6">
          <div>
            <NavLink to={'/docs'} className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2 text-[#4CC9F0] mb-1">
                <Wrench size={18} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Maintenance Portal Docs</span>
                <ArrowRight size={18} className="animate-pulse" />
              </div>
            </NavLink>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">
              Technician Operations Terminal
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1">
              Review current system registries, diagnose reported issues, and fulfill hardware tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input Box */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search asset, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-[#4CC9F0] focus:ring-1 focus:ring-[#4CC9F0] outline-none text-slate-200 placeholder-slate-500 text-sm transition-all"
              />
            </div>

            {/* 🌟 NEW: Interactive Glass-Tech Refresh Button */}
            <button
              onClick={() => loadAssets(false)} // false keeps full page loader hidden during background refresh
              disabled={isRefreshing || isLoading}
              className="relative flex items-center justify-center p-3 bg-slate-900/60 hover:bg-slate-800/80 disabled:bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 rounded-xl text-slate-300 hover:text-white cursor-pointer active:scale-95 disabled:pointer-events-none transition-all duration-200 group shadow-md"
              title="Sync Database"
            >
              <RotateCw
                size={16}
                className={`text-[#4CC9F0] group-hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-45'
                  } transition-transform duration-300`}
              />
            </button>

            {/* Logout Button */}
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

        {/* Dynamic Metrics Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Box 1: Total Pipeline */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-[#4CC9F0]/10 border border-[#4CC9F0]/20 text-[#4CC9F0] rounded-xl">
              <LayoutGrid size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pipeline</p>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5">{totalCount} Assets</h3>
            </div>
          </div>

          {/* Box 2: Active Workorders */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Workorders</p>
              <h3 className="text-xl font-bold text-amber-400 mt-0.5">{maintenanceCount} In Progress</h3>
            </div>
          </div>

          {/* Box 3: Fault Alerts */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fault Alerts</p>
              <h3 className="text-xl font-bold text-rose-400 mt-0.5">{faultCount} Offline / Damaged</h3>
            </div>
          </div>
        </div>

        {/* Asset Cards Display pipeline */}
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading assets..." />
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
              <CheckCircle2 size={36} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No matching system registries loaded.</p>
              <p className="text-slate-600 text-xs mt-1">Try relaxing your search parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                console.log("Rendering asset:", asset) ||
                <TechAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>

      </div>
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
            For detailed instructions, diagrams, and troubleshooting tips, please visit our online documentation at <NavLink to="/docs" className="text-[#4CC9F0] underline">MaintainIQ Docs</NavLink>.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard;