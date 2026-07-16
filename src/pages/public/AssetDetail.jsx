import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, updateDoc, addDoc, collection, onSnapshot } from '../../config/firebase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, RefreshCw, Send, UserCheck, ClipboardList, PackageX, Lock } from 'lucide-react';

function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [asset, setAsset] = useState(null); // Asset ka real-time data store karne ke liye
  const [isLoadingAsset, setIsLoadingAsset] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('handover'); 
  
  // Form states
  const [currentStatus, setCurrentStatus] = useState('active');
  const [techNotes, setTechNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [techName, setTechName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState('');

  // --- 1. Real-time Firebase Listener (No Redux) ---
  useEffect(() => {
    setIsLoadingAsset(true);
    const assetRef = doc(db, 'assets', id);

    // onSnapshot real-time updates sunta hai (jaise hi admin approve karega, yahan status khud badal jayega)
    const unsubscribe = onSnapshot(assetRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        const updatedAsset = { id: docSnap.id, ...data };
        
        setAsset(updatedAsset);
        setCurrentStatus(updatedAsset.status || 'active');
        setTechNotes(updatedAsset.notes || '');
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setIsLoadingAsset(false);
    }, (error) => {
      console.error("Error listening to asset:", error);
      setIsLoadingAsset(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [id]);

  // --- STRICT LOCK RULE ---
  // Progress Tab sirf tab khulega jab asset ka status 'maintenance' hoga (Admin Approval ke baad)
  const isLocked = asset?.status !== 'maintenance';

  // --- 2. Progress Update Submit ---
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (isLocked) {
      setConfirmationMsg("Warning: Section Locked! Handover approval is mandatory first.");
      return;
    }
    setIsUpdating(true);
    setConfirmationMsg('');

    try {
      const assetRef = doc(db, "assets", id);
      const updateData = {
        status: currentStatus,
        notes: techNotes,
        lastUpdatedBy: "Technician Portal",
        updatedAt: new Date().toISOString()
      };

      await updateDoc(assetRef, updateData);
      setConfirmationMsg(`Status successfully updated to: ${currentStatus.toUpperCase()}`);
    } catch (error) {
      console.error(error);
      setConfirmationMsg('Update failed. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 3. Handover Request Submit ---
  const handleRequestTask = async (e) => {
    e.preventDefault();
    setIsSubmittingReq(true);
    setConfirmationMsg('');

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

      // 1. Send request to 'handover_requests' collection
      await addDoc(collection(db, "handover_requests"), requestPayload);

      // 2. Change current asset status to 'pending_approval'
      const assetRef = doc(db, "assets", id);
      await updateDoc(assetRef, { status: 'pending_approval' });

      setConfirmationMsg("Handover requested! Status is now pending admin approval.");
      setTechName('');
      setEstimatedTime('');
      setRequestNotes('');
    } catch (error) {
      console.error(error);
      setConfirmationMsg('Failed to send request. Try again.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // --- Loading State Screen ---
  if (isLoadingAsset) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <LoadingSpinner message="Loading asset details..." />
      </div>
    );
  }

  // --- Not Found Screen ---
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <PackageX size={40} className="text-slate-600" />
        <p className="text-slate-300 font-semibold">Asset Not Found.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-[#4CC9F0] hover:underline cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 lg:p-10 font-sans antialiased">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-[#4CC9F0] hover:text-white transition-colors cursor-pointer group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* Asset Main Details Header Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <span className="text-[10px] font-mono text-slate-500 block">ID: {id}</span>
          <div className="flex justify-between items-center mt-1">
            <h1 className="text-xl font-black text-slate-100">{asset?.assetName}</h1>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              asset?.status === 'maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              asset?.status === 'pending_approval' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
              asset?.status === 'inactive' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {asset?.status === 'pending_approval' ? 'Pending Approval' : asset?.status || 'Active'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Serial Number: <strong className="text-slate-300">{asset?.serialNumber}</strong></p>
        </div>

        {/* Global Feedback Message Box */}
        {confirmationMsg && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3.5 rounded-xl">
            <CheckCircle size={14} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{confirmationMsg}</span>
          </div>
        )}

        {/* Navigation Tabs (Step 1 and Step 2) */}
        <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('handover'); setConfirmationMsg(''); }}
            className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'handover'
                ? 'bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck size={14} />
            1. Request Handover
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('progress'); setConfirmationMsg(''); }}
            className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw size={14} />
            2. Report Progress
            {isLocked && <Lock size={12} className="text-rose-400 absolute right-3" />}
          </button>
        </div>

        {/* Tab Form Screen Container */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">

          {/* TAB 1: REPORT PROGRESS FORM */}
          {activeTab === 'progress' ? (
            isLocked ? (
              // If Locked (Maintenance mode is not active yet)
              <div className="text-center py-8 space-y-3">
                <div className="p-4 bg-rose-500/10 rounded-full w-fit mx-auto border border-rose-500/20 text-rose-400">
                  <Lock size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-300">Section Locked</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Progress cannot be updated until the asset handover request is approved by the Admin.
                </p>
                {asset?.status === 'pending_approval' && (
                  <span className="inline-block text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                    Waiting for Admin Approval...
                  </span>
                )}
              </div>
            ) : (
              // If Unlocked (Asset is in maintenance)
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#4CC9F0]" /> Log Operational Progress
                </h2>

                <form onSubmit={handleStatusUpdate} className="space-y-5">
                  {/* Status Selection Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStatus('maintenance')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        currentStatus === 'maintenance'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Clock size={18} />
                      <span className="text-[10px] font-bold">In Progress</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStatus('inactive')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        currentStatus === 'inactive'
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <AlertTriangle size={18} />
                      <span className="text-[10px] font-bold">Fault</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStatus('active')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        currentStatus === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CheckCircle size={18} />
                      <span className="text-[10px] font-bold">Completed</span>
                    </button>
                  </div>

                  {/* Notes Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes / Logs</label>
                    <textarea
                      rows={4}
                      value={techNotes}
                      onChange={(e) => setTechNotes(e.target.value)}
                      placeholder="Write repair/maintenance process logs here..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-[#4CC9F0] outline-none placeholder-slate-600 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-3 bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white font-bold rounded-xl text-sm cursor-pointer shadow-lg shadow-indigo-500/5 hover:brightness-105 transition-all"
                  >
                    {isUpdating ? 'Saving Update...' : 'Send Progress Update'}
                  </button>
                </form>
              </div>
            )
          ) : (
            /* TAB 2: REQUEST HANDOVER FORM */
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <UserCheck size={16} className="text-[#4CC9F0]" /> Request Asset Handover
              </h2>

              <form onSubmit={handleRequestTask} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technician Name</label>
                    <input
                      type="text"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      placeholder="e.g. Rahul"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-[#4CC9F0] outline-none placeholder-slate-600 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Duration</label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g. 2 Hours"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-[#4CC9F0] outline-none placeholder-slate-600 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Details / Reason</label>
                  <textarea
                    rows={4}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Describe why you need this asset handover approved..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-[#4CC9F0] outline-none placeholder-slate-600 transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReq || asset?.status === 'pending_approval'}
                  className="w-full py-3 bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-lg shadow-indigo-500/5 hover:brightness-105 transition-all"
                >
                  <Send size={15} />
                  {isSubmittingReq ? 'Sending...' : asset?.status === 'pending_approval' ? 'Approval Already Pending' : 'Send Handover Request'}
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