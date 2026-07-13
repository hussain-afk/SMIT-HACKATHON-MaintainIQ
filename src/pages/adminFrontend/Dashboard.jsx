import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal'; // Adjust this path if needed
import AdminAssetCard from '../../components/adminCard'; // Adjust this path if needed
import { db, addDoc, collection, getDocs, doc, updateDoc, deleteDoc } from '../../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { addAsset, updateAssetStatus } from '../../redux/reducers/assetSlice'; // Ensure updateAssetStatus exists in your slice
import { Plus, BarChart3, ShieldCheck, Activity, Package, ClipboardList, Check, X } from 'lucide-react';

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handoverRequests, setHandoverRequests] = useState([]);
  
  // State for form fields
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('machinery');
  const [serialNumber, setSerialNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  
  // Redux
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.asset.assets || []);

  // 1. Calculate dynamic statistics parameters
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status?.toLowerCase() === 'active' || a.isActive === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status?.toLowerCase() === 'maintenance').length;

  // 2. Fetch Assets and Tech Handover Requests from Firestore
  async function fetchDashboardData() {
    try {
      // Fetch Assets
      const assetSnapshot = await getDocs(collection(db, "assets"));
      assetSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        dispatch(addAsset({ id: docSnap.id, ...data }));
      });

      // Fetch Pending Technician Handover Tickets
      const requestSnapshot = await getDocs(collection(db, "handover_requests"));
      const requestsList = [];
      requestSnapshot.forEach((docSnap) => {
        requestsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setHandoverRequests(requestsList);

    } catch (error) {
      console.error("Error loading administration terminal cluster matrix:", error);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 3. Handle Creation of New Assets
  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    try {
      const assetData = {
        assetName,
        assetCategory,
        serialNumber,
        description,
        status,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "assets"), assetData);
      dispatch(addAsset({ id: docRef.id, ...assetData }));
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error writing document registry asset:", error);
    }
  };

  // 4. Handle Handover Approvals from Technicians
  // 4. Handle Handover Approvals from Technicians
  const handleApproveHandover = async (request) => {
    try {
      // Step A: Update status and set assigning targets in Firestore
      const assetRef = doc(db, "assets", request.assetId);
      await updateDoc(assetRef, { 
        status: 'maintenance',
        assignedTo: request.techName 
      });

      // Step B: Delete request from handover queue collection
      await deleteDoc(doc(db, "handover_requests", request.id));

      // Step C: Update local UI states for the request cards
      setHandoverRequests(prev => prev.filter(r => r.id !== request.id));

      // Step D: Re-fetch assets directly so Redux updates and statistics update live!
      const assetSnapshot = await getDocs(collection(db, "assets"));
      assetSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        dispatch(addAsset({ id: docSnap.id, ...data }));
      });

      alert(`Asset tracking authorization successfully handed over to ${request.techName}!`);
    } catch (error) {
      console.error("Critical handover confirmation execution fault:", error);
    }
  };

  // 5. Handle Handover Rejections
  const handleRejectHandover = async (requestId) => {
    if (window.confirm("Are you sure you want to decline this technician's handover claim?")) {
      try {
        await deleteDoc(doc(db, "handover_requests", requestId));
        setHandoverRequests(prev => prev.filter(r => r.id !== requestId));
      } catch (error) {
        console.error("Error removing request node component registry entry:", error);
      }
    }
  };

  const resetForm = () => {
    setAssetName('');
    setAssetCategory('machinery');
    setSerialNumber('');
    setDescription('');
    setStatus('active');
  };

  return (
    <>
      <div className="min-h-screen bg-[#0B132B] text-slate-100 p-6 lg:p-10 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1C2541]/40 border border-[#3A506B]/30 p-6 rounded-2xl backdrop-blur-md">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-100">
                Administration Control Center
              </h1>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">
                Real-time tracking, hardware registers, and deployment status parameters.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-[#4CC9F0] to-[#4361EE] hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#4361EE]/20 transition-all cursor-pointer transform active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              Register Asset
            </button>
          </div>

          {/* Quick Metrics Statistics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1C2541]/40 border border-[#3A506B]/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Systems</p>
                <h3 className="text-2xl font-black mt-1 text-slate-100">{totalAssets}</h3>
              </div>
              <div className="p-3 bg-[#0B132B] border border-[#3A506B]/40 text-slate-300 rounded-xl">
                <Package size={20} />
              </div>
            </div>

            <div className="bg-[#1C2541]/40 border border-[#3A506B]/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Operational</p>
                <h3 className="text-2xl font-black mt-1 text-emerald-400">{activeAssets}</h3>
              </div>
              <div className="p-3 bg-[#0B132B] border border-[#3A506B]/40 text-emerald-400 rounded-xl">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="bg-[#1C2541]/40 border border-[#3A506B]/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance</p>
                <h3 className="text-2xl font-black mt-1 text-amber-400">{maintenanceAssets}</h3>
              </div>
              <div className="p-3 bg-[#0B132B] border border-[#3A506B]/40 text-amber-400 rounded-xl">
                <Activity size={20} />
              </div>
            </div>
          </div>

          {/* Dynamic Handover Requests Section */}
          {handoverRequests.length > 0 && (
            <div className="bg-[#1C2541]/40 border border-[#3A506B]/40 p-6 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4 text-[#4CC9F0]">
                <ClipboardList size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Incoming Handover Workorders ({handoverRequests.length})
                </h2>
              </div>
              <div className="space-y-4">
                {handoverRequests.map((req) => (
                  <div key={req.id} className="bg-[#0B132B]/60 border border-[#3A506B]/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        Technician <span className="text-[#4CC9F0]">{req.techName}</span> requests handover for <span className="text-[#4361EE]">{req.assetName}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-300">Est:</span> {req.estimatedTime} | 
                        <span className="font-semibold text-slate-300 ml-2">Notes:</span> "{req.notes}"
                      </p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleApproveHandover(req)}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Check size={14} /> Approve & Handover
                      </button>
                      <button 
                        onClick={() => handleRejectHandover(req.id)}
                        className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Asset Rendering Main Dashboard Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={16} className="text-[#4CC9F0]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Active Registries</h2>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#3A506B]/30 rounded-2xl bg-[#1C2541]/10">
                <p className="text-slate-400 text-sm">No assets discovered in the cluster system database.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-xs font-bold text-[#4CC9F0] hover:underline cursor-pointer"
                >
                  Create your first asset entry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset) => (
                  <AdminAssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal Registry Entry Container Block */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Register New Asset"
      >
        <form onSubmit={handleRegisterAsset} className="space-y-5">
          {/* Asset Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="assetName">
              Asset Name
            </label>
            <input
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              type="text"
              id="assetName"
              placeholder="e.g. HVAC Unit 4, CNC Lathe"
              className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 placeholder-slate-600 text-sm"
              required
            />
          </div>

          {/* Asset Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="assetCategory">
              Category
            </label>
            <select
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
              id="assetCategory"
              className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 text-sm"
            >
              <option value="machinery" className="bg-[#0B132B]">Machinery & Equipment</option>
              <option value="facilities" className="bg-[#0B132B]">Facilities & Building</option>
              <option value="fleet" className="bg-[#0B132B]">Fleet & Vehicles</option>
              <option value="it" className="bg-[#0B132B]">IT Infrastructure</option>
            </select>
          </div>

          {/* Serial / Tag Number */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="serialNumber">
              Serial / Tag Number
            </label>
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              type="text"
              id="serialNumber"
              placeholder="e.g. AQ-90823-X"
              className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 placeholder-slate-600 text-sm"
            />
          </div>

          {/* Initial Operational Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="assetStatus">
              Initial Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              id="assetStatus"
              className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 text-sm"
            >
              <option value="active" className="text-emerald-400 bg-[#0B132B]">Active / Functional</option>
              <option value="maintenance" className="text-amber-400 bg-[#0B132B]">Under Maintenance</option>
              <option value="inactive" className="text-rose-400 bg-[#0B132B]">Inactive / Offline</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="description">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="description"
              rows={3}
              placeholder="e.g. Requires standard quarterly calibration inspections."
              className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 placeholder-slate-600 text-sm resize-none"
            />
          </div>

          {/* Action Control Trigger Set */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="w-1/2 py-3 bg-transparent border border-[#3A506B]/60 text-slate-400 font-semibold rounded-xl hover:bg-[#1C2541]/40 transition-colors cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-linear-to-r from-[#4CC9F0] to-[#4361EE] text-white font-semibold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Register Asset
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Dashboard;