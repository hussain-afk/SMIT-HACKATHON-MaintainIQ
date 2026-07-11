import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Bot,
} from 'lucide-react';

const STATUS_FLOW = ['Open', 'In Progress', 'Resolved'];

function StatusBadge({ status }) {
  const styles = {
    Open: 'bg-red-500/10 text-red-400 border-red-500/20',
    'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const icons = {
    Open: AlertTriangle,
    'In Progress': Clock,
    Resolved: CheckCircle2,
  };
  const Icon = icons[status] || AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${styles[status] || styles.Open}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}

function IssueRow({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, 'issues', issue.id), { status: newStatus });
      await addDoc(collection(db, 'activityLog'), {
        action: `Issue #${issue.id.slice(0, 6)} status changed to "${newStatus}"`,
        type: newStatus === 'Resolved' ? 'resolved' : 'issue',
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSendingNote(true);
    try {
      const existingNotes = issue.technicianNotes || [];
      await updateDoc(doc(db, 'issues', issue.id), {
        technicianNotes: [
          ...existingNotes,
          {
            text: newNote.trim(),
            addedAt: new Date().toISOString(),
          },
        ],
      });
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSendingNote(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 overflow-hidden transition-all duration-300 hover:border-[#3A506B]/60">
      {/* Issue Summary Row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-xl bg-[#F72585]/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-[#F72585]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-white font-medium truncate">{issue.description}</p>
            {issue.priority && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                issue.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                issue.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <Bot size={10} />
                {issue.priority}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Asset: {issue.assetId?.slice(0, 8)}... •{' '}
            {issue.reportedAt?.seconds
              ? new Date(issue.reportedAt.seconds * 1000).toLocaleDateString()
              : 'Unknown date'}
          </p>
        </div>
        <StatusBadge status={issue.status} />
        <div className="text-gray-500">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#3A506B]/30 pt-4 space-y-4">
          {/* Evidence */}
          {issue.evidenceUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} /> Evidence Attached
              </p>
              <img
                src={issue.evidenceUrl}
                alt="Issue evidence"
                className="w-full max-w-sm rounded-xl border border-[#3A506B]/30 object-cover"
              />
            </div>
          )}

          {/* Status Controls */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Update Status</p>
            <div className="flex gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  disabled={issue.status === s || updatingStatus}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    issue.status === s
                      ? 'bg-[#4CC9F0]/20 text-[#4CC9F0] border border-[#4CC9F0]/30 cursor-default'
                      : 'bg-white/5 text-gray-400 border border-[#3A506B]/30 hover:bg-white/10 hover:text-white'
                  } disabled:opacity-40`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Technician Notes */}
          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} /> Technician Notes
            </p>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {(issue.technicianNotes || []).length > 0 ? (
                issue.technicianNotes.map((note, idx) => (
                  <div key={idx} className="px-3 py-2 rounded-lg bg-[#0B132B]/60 border border-[#3A506B]/20">
                    <p className="text-sm text-gray-300">{note.text}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(note.addedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-600 italic">No notes yet.</p>
              )}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a technician note..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#0B132B]/80 border border-[#3A506B]/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4CC9F0]/60 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={sendingNote || !newNote.trim()}
                className="px-3 py-2 rounded-lg bg-[#4CC9F0]/20 text-[#4CC9F0] hover:bg-[#4CC9F0]/30 transition-all duration-200 disabled:opacity-40"
              >
                {sendingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssueTriage() {
  const [issues, setIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('reportedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filtered = filterStatus === 'All' ? issues : issues.filter((i) => i.status === filterStatus);

  const counts = {
    All: issues.length,
    Open: issues.filter((i) => i.status === 'Open').length,
    'In Progress': issues.filter((i) => i.status === 'In Progress').length,
    Resolved: issues.filter((i) => i.status === 'Resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Issue Triage</h1>
        <p className="text-gray-400 text-sm mt-1">Manage and resolve reported issues</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filterStatus === s
                ? 'bg-gradient-to-r from-[#4CC9F0]/20 to-[#4361EE]/10 text-[#4CC9F0] border border-[#4CC9F0]/20'
                : 'bg-white/5 text-gray-400 border border-[#3A506B]/30 hover:bg-white/10 hover:text-white'
            }`}
          >
            {s}
            <span className="ml-2 text-xs opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((issue) => <IssueRow key={issue.id} issue={issue} />)
        ) : (
          <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 py-16 text-center">
            <AlertTriangle size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No issues found</p>
            <p className="text-gray-500 text-sm mt-1">
              {filterStatus !== 'All' ? 'Try a different filter.' : 'Issues reported by users will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
