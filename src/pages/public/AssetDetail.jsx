import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { db, doc, updateDoc, addDoc, collection } from '../../config/firebase';
import { addAsset } from '../../redux/reducers/assetSlice';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, RefreshCw, Send, UserCheck, ClipboardList } from 'lucide-react';

function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Find asset locally from Redux first
  const asset = useSelector((state) => 
    state.asset?.assets.find((item) => item.id === id)
  );

  // 🎛️ Active Tab State ('progress' or 'handover')
  const [activeTab, setActiveTab] = useState('progress');

  // States for Status Update Form
  const [currentStatus, setCurrentStatus] = useState(asset?.status || 'active');
  const [techNotes, setTechNotes] = useState(asset?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // States for Handover Request Form
  const [techName, setTechName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Sync status if asset loads late via Redux
  useEffect(() => {
    if (asset) {
      setCurrentStatus(asset.status);
      setTechNotes(asset.notes || '');
    }
  }, [asset]);

  // Handler 1: Update Job Progress State
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const assetRef = doc(db, "assets", id);
      const updateData = {
        status: currentStatus,
        notes: techNotes,
        lastUpdatedBy: "Technician Portal",
        updatedAt: new Date().toISOString()
      };

      await updateDoc(assetRef, updateData);

      if (asset) {
        dispatch(addAsset({ ...asset, ...updateData }));
      }

      alert(`Progress status successfully updated to: ${currentStatus.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating operational progress parameter:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler 2: Submit Handover Request to Admin
  const handleRequestTask = async (e) => {
    e.preventDefault();
    setIsSubmittingReq(true);

    try {
      const requestPayload = {
        assetId: id,
        assetName: asset?.assetName || 'Unknown Asset',
        serialNumber: asset?.serialNumber || 'N/A',
        techName,
        estimatedTime,
        notes: requestNotes,
        status: 'pending_approval', 
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "handover_requests"), requestPayload);

      alert("Your request has been sent to the Admin dashboard for approval!");
      
      setTechName('');
      setEstimatedTime('');
      setRequestNotes('');
    } catch (error) {
      console.error("Error submitting tech request:", error);
    } finally {
      setIsSubmittingReq(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-[#4CC9F0] hover:text-white transition-colors cursor-pointer group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> 
          Back to Operations Terminal
        </button>

        {/* Asset Context Details */}
        <div className="bg-[#1C2541]/40 border border-[#3A506B]/30 p-6 rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Asset Node Signature: {id}</span>
          <h1 className="text-xl font-black mt-1 text-slate-100">{asset?.assetName || 'System Registry Element'}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Serial Reference: <span className="text-slate-200 font-mono">{asset?.serialNumber || 'N/A'}</span>
          </p>
        </div>

        {/* 🎛️ Modern Toggle Control Switch Container */}
        <div className="bg-[#1C2541]/60 p-1.5 rounded-xl border border-[#3A506B]/30 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-linear-to-r from-[#4CC9F0] to-[#4361EE] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B132B]/30'
            }`}
          >
            <RefreshCw size={14} className={activeTab === 'progress' ? 'animate-spin-slow' : ''} />
            Report Progress
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('handover')}
            className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'handover'
                ? 'bg-linear-to-r from-[#4CC9F0] to-[#4361EE] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B132B]/30'
            }`}
          >
            <UserCheck size={14} />
            Request Handover
          </button>
        </div>

        {/* 🔄 Dynamic Form Rendering Panel Based on Toggle State */}
        <div className="bg-[#1C2541]/20 border border-[#3A506B]/20 rounded-2xl p-6 transition-all duration-300">
          
          {activeTab === 'progress' ? (
            /* TAB 1: Status Update Control Terminal Panel */
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ClipboardList size={16} className="text-[#4CC9F0]" /> Log Operational Progress Stage
              </h2>

              <form onSubmit={handleStatusUpdate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-400 block">
                    Select Operational State
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStatus('maintenance')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        currentStatus === 'maintenance' 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                          : 'bg-[#0B132B]/60 border-[#3A506B]/40 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <Clock size={20} />
                      <span className="text-xs font-bold uppercase tracking-wide">In Progress</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStatus('inactive')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        currentStatus === 'inactive' 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400' 
                          : 'bg-[#0B132B]/60 border-[#3A506B]/40 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <AlertTriangle size={20} />
                      <span className="text-xs font-bold uppercase tracking-wide">Stalled / Fault</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStatus('active')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        currentStatus === 'active' 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-[#0B132B]/60 border-[#3A506B]/40 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <CheckCircle size={20} />
                      <span className="text-xs font-bold uppercase tracking-wide">Completed</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-400 block">
                    Maintenance Logs / Live Updates
                  </label>
                  <textarea
                    rows={4}
                    value={techNotes}
                    onChange={(e) => setTechNotes(e.target.value)}
                    placeholder="Describe current operations or actions taken."
                    className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm resize-none focus:border-[#4CC9F0] outline-none placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3.5 bg-linear-to-r from-[#4CC9F0] to-[#4361EE] text-white font-bold rounded-xl shadow-lg text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Synchronizing Control Logs...' : 'Transmit Progress to Admin'}
                </button>
              </form>
            </div>
          ) : (
            /* TAB 2: Handover Request Form */
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <UserCheck size={16} className="text-[#4CC9F0]" /> Submit Assignment Handover Request
              </h2>

              <form onSubmit={handleRequestTask} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 block">
                      Your Name / Tech ID
                    </label>
                    <input
                      type="text"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm focus:border-[#4CC9F0] outline-none placeholder-slate-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 block">
                      Estimated Time Needed
                    </label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g. 4 Hours"
                      className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm focus:border-[#4CC9F0] outline-none placeholder-slate-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-400 block">
                    Why should this task be handed over to you?
                  </label>
                  <textarea
                    rows={4}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Write your note to the admin regarding this asset handover."
                    className="w-full px-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl text-slate-200 text-sm resize-none focus:border-[#4CC9F0] outline-none placeholder-slate-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReq}
                  className="w-full py-3.5 bg-linear-to-r from-[#4CC9F0] to-[#4361EE] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send size={16} />
                  {isSubmittingReq ? 'Submitting Form to Admin...' : 'Send Handover Request'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AssetDetail;