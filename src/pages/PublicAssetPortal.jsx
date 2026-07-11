import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  MapPin,
  Hash,
  Tag,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  ImagePlus,
  Wrench,
  FileText,
  Shield,
} from 'lucide-react';

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-500/10 text-emerald-400',
    Maintenance: 'bg-amber-500/10 text-amber-400',
    Decommissioned: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || styles.Active}`}>
      {status || 'Active'}
    </span>
  );
}

function HistoryItem({ issue }) {
  const iconMap = {
    Open: { icon: AlertTriangle, color: '#F72585' },
    'In Progress': { icon: Clock, color: '#FFA62B' },
    Resolved: { icon: CheckCircle2, color: '#4ADE80' },
  };
  const { icon: Icon, color } = iconMap[issue.status] || iconMap.Open;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-300">{issue.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">
            {issue.reportedAt ? new Date(issue.reportedAt.seconds * 1000).toLocaleDateString() : 'Recently'}
          </span>
          <span className={`text-xs font-medium`} style={{ color }}>
            {issue.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PublicAssetPortal() {
  const { assetId } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [issues, setIssues] = useState([]);
  const [description, setDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch asset data
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const snap = await getDoc(doc(db, 'assets', assetId));
        if (snap.exists()) {
          setAsset({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to fetch asset:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetId]);

  // Subscribe to issues for this asset
  useEffect(() => {
    if (!assetId) return;
    const q = query(
      collection(db, 'issues'),
      where('assetId', '==', assetId),
      orderBy('reportedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [assetId]);

  // Mocked AI Priority Classifier
  const analyzePriority = (desc) => {
    const text = desc.toLowerCase();
    if (text.includes('fire') || text.includes('smoke') || text.includes('leak') || text.includes('urgent') || text.includes('broken')) {
      return 'High';
    }
    if (text.includes('noise') || text.includes('slow') || text.includes('warm') || text.includes('calibration')) {
      return 'Medium';
    }
    return 'Low';
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      let finalEvidenceUrl = null;

      // Handle file upload
      if (evidenceFile) {
        const fileRef = ref(storage, `evidence/${Date.now()}_${evidenceFile.name}`);
        const snapshot = await uploadBytes(fileRef, evidenceFile);
        finalEvidenceUrl = await getDownloadURL(snapshot.ref);
      }

      // Mock AI classification
      const priority = analyzePriority(description);

      await addDoc(collection(db, 'issues'), {
        assetId,
        description: description.trim(),
        evidenceUrl: finalEvidenceUrl,
        priority, // The AI-determined priority
        status: 'Open',
        technicianNotes: [],
        reportedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'activityLog'), {
        action: `New issue reported for asset "${asset?.name || assetId}" (AI Priority: ${priority})`,
        type: 'issue',
        timestamp: serverTimestamp(),
      });
      setDescription('');
      setEvidenceFile(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#4CC9F0]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center px-4">
        <div className="text-center">
          <Package size={56} className="text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Asset Not Found</h1>
          <p className="text-gray-400">This asset ID does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const inputClasses =
    'w-full px-4 py-2.5 rounded-xl bg-[#0B132B]/80 border border-[#3A506B]/50 text-white placeholder-gray-500 focus:outline-none focus:border-[#4CC9F0]/60 focus:ring-1 focus:ring-[#4CC9F0]/30 transition-all duration-200 text-sm';

  return (
    <div className="min-h-screen bg-[#0B132B]">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#4CC9F0]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-[#4361EE]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4CC9F0] to-[#4361EE] flex items-center justify-center shadow-lg shadow-[#4CC9F0]/20">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Maintain<span className="text-[#4CC9F0]">IQ</span>
            </h1>
            <p className="text-xs text-gray-500">Public Asset Portal</p>
          </div>
        </div>

        {/* Asset Info Card */}
        <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4CC9F0]/20 to-[#4361EE]/20 flex items-center justify-center">
                <Package size={24} className="text-[#4CC9F0]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{asset.name}</h2>
                <p className="text-xs text-gray-500 font-mono">ID: {asset.id.slice(0, 12)}...</p>
              </div>
            </div>
            <div className="flex gap-4">
              <StatusBadge status={asset.status} />
              {asset.qrCodeUrl && (
                <div className="p-1 bg-white/5 rounded-lg border border-[#3A506B]/30 hidden sm:block">
                  <QRCodeSVG value={asset.qrCodeUrl} size={48} level="L" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0B132B]/50 border border-[#3A506B]/20">
              <Tag size={16} className="text-[#4CC9F0]" />
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm text-white font-medium">{asset.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0B132B]/50 border border-[#3A506B]/20">
              <Hash size={16} className="text-[#4CC9F0]" />
              <div>
                <p className="text-xs text-gray-500">Serial</p>
                <p className="text-sm text-white font-medium font-mono">{asset.serialNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0B132B]/50 border border-[#3A506B]/20">
              <MapPin size={16} className="text-[#4CC9F0]" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-white font-medium">{asset.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Issue History */}
        <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#4361EE]" />
            <h3 className="text-base font-semibold text-white">Issue History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#4361EE]/10 text-[#4361EE] font-medium ml-auto">
              {issues.length}
            </span>
          </div>
          <div className="divide-y divide-[#3A506B]/20">
            {issues.length > 0 ? (
              issues.map((issue) => <HistoryItem key={issue.id} issue={issue} />)
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No issues reported for this asset.</p>
            )}
          </div>
        </div>

        {/* Report Form */}
        <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-[#F72585]" />
            <h3 className="text-base font-semibold text-white">Report a Breakdown</h3>
          </div>

          {submitted && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              Report submitted successfully! A technician will review it shortly.
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe the issue in detail..."
                className={`${inputClasses} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ImagePlus size={14} />
                  Upload Evidence Image
                  <span className="text-gray-500 font-normal">(optional)</span>
                </span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEvidenceFile(e.target.files[0])}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B132B]/80 border border-[#3A506B]/50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4CC9F0]/10 file:text-[#4CC9F0] hover:file:bg-[#4CC9F0]/20 focus:outline-none transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F72585] to-[#4361EE] text-white text-sm font-semibold shadow-lg shadow-[#F72585]/20 hover:shadow-[#F72585]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-8">
          Powered by MaintainIQ • Asset Tracking System
        </p>
      </div>
    </div>
  );
}
