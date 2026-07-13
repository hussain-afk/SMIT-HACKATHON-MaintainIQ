import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { db, collection, getDocs } from '../../config/firebase' 
import { addAsset } from '../../redux/reducers/assetSlice' 
import TechAssetCard from '../../components/TechAssetCard'; 
import { Wrench, Search, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function Dashboard() {
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.asset?.assets || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log("Assets in TechDashboard:", assets); 

  useEffect(() => {
    if (assets.length === 0) {
      const loadAssets = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "assets"));
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
              data.createdAt = data.createdAt.toDate().toISOString();
            }
            
            dispatch(addAsset({ id: doc.id, ...data }));
          });
        } catch (error) {
          console.error("Tech Dashboard data load error:", error);
        }
      };

      loadAssets();
    }
  }, [dispatch, assets.length]);

  // Derived metrics for technical status summary counters
  const totalCount = assets.length;
  const maintenanceCount = assets.filter(a => a.status?.toLowerCase() === 'maintenance').length;
  const faultCount = assets.filter(a => a.status?.toLowerCase() === 'inactive').length;

  // Search filtering logic to quickly find specific serial numbers or asset tags
  const filteredAssets = assets.filter(asset => 
    asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.assetCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Information Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#3A506B]/30 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#4CC9F0]">
              <Wrench size={18} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#4CC9F0]">Maintenance Portal</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-100 mt-1">
              Technician Operations Terminal
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
              Review current system registries, diagnose reported issues, and fulfill hardware tasks.
            </p>
          </div>

          {/* Real-time Search Controller Input field */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search asset, category, or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C2541]/40 border border-[#3A506B]/50 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 placeholder-slate-600 text-sm backdrop-blur-md"
            />
          </div>
        </div>

        {/* Dynamic Technician Metrics Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-[#0B132B] border border-[#3A506B]/40 text-[#4CC9F0] rounded-xl">
              <LayoutGrid size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Pipeline</p>
              <h3 className="text-xl font-bold text-slate-200">{totalCount} Assets</h3>
            </div>
          </div>

          <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-[#0B132B] border border-[#3A506B]/40 text-amber-400 rounded-xl">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Workorders</p>
              <h3 className="text-xl font-bold text-amber-400">{maintenanceCount} In Progress</h3>
            </div>
          </div>

          <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-[#0B132B] border border-[#3A506B]/40 text-rose-400 rounded-xl">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fault Alerts</p>
              <h3 className="text-xl font-bold text-rose-400">{faultCount} Offline / Damaged</h3>
            </div>
          </div>
        </div>

        {/* Asset Cards Rendering Pipeline */}
        <div className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#3A506B]/20 rounded-2xl bg-[#1C2541]/10">
              <CheckCircle2 size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No matching system registries loaded.</p>
              <p className="text-slate-600 text-xs mt-1">Try relaxing your search parameters or check filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <NavLink to={`/tech/asset/${asset.id}`} key={asset.id}>
                  <TechAssetCard key={asset.id} asset={asset} />
                </NavLink>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard;