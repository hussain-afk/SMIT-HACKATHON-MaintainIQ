import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Sparkles,
} from 'lucide-react';

function MetricCard({ title, value, icon: Icon, trend, trendUp, accentColor }) {
  return (
    <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-5 hover:border-[#3A506B]/70 transition-all duration-300 group hover:shadow-lg hover:shadow-[#4CC9F0]/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon size={22} style={{ color: accentColor }} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {trendUp ? (
            <ArrowUpRight size={16} className="text-emerald-400" />
          ) : (
            <ArrowDownRight size={16} className="text-red-400" />
          )}
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend}
          </span>
          <span className="text-xs text-gray-500">vs last week</span>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ action, timestamp, type }) {
  const typeStyles = {
    asset: { color: '#4CC9F0', bg: 'bg-[#4CC9F0]/10', icon: Package },
    issue: { color: '#F72585', bg: 'bg-[#F72585]/10', icon: AlertTriangle },
    resolved: { color: '#4ADE80', bg: 'bg-[#4ADE80]/10', icon: CheckCircle2 },
  };
  const style = typeStyles[type] || typeStyles.asset;
  const Icon = style.icon;

  return (
    <div className="flex items-start gap-3 py-3 group">
      <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={16} style={{ color: style.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-relaxed">{action}</p>
        <p className="text-xs text-gray-500 mt-1">
          {timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'Just now'}
        </p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [assets, setAssets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    const unsubAssets = onSnapshot(collection(db, 'assets'), (snap) => {
      setAssets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubIssues = onSnapshot(collection(db, 'issues'), (snap) => {
      setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const recentQuery = query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(15));
    const unsubRecent = onSnapshot(recentQuery, (snap) => {
      setRecentActions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubAssets();
      unsubIssues();
      unsubRecent();
    };
  }, []);

  const totalAssets = assets.length;
  const activeIssues = issues.filter((i) => i.status === 'Open' || i.status === 'In Progress').length;
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved').length;
  const pendingMaintenance = assets.filter((a) => a.status === 'Maintenance').length;

  const metrics = [
    { title: 'Total Assets', value: totalAssets, icon: Package, accentColor: '#4CC9F0', trend: '+12%', trendUp: true },
    { title: 'Active Issues', value: activeIssues, icon: AlertTriangle, accentColor: '#F72585', trend: '-5%', trendUp: false },
    { title: 'Resolved', value: resolvedIssues, icon: CheckCircle2, accentColor: '#4ADE80', trend: '+18%', trendUp: true },
    { title: 'Pending Maintenance', value: pendingMaintenance, icon: Clock, accentColor: '#FFA62B', trend: '+3%', trendUp: true },
  ];

  const generateAISummary = () => {
    setGeneratingSummary(true);
    setTimeout(() => {
      const issuesRatio = issues.length > 0 ? resolvedIssues / issues.length : 1;
      const maintenanceRatio = totalAssets > 0 ? pendingMaintenance / totalAssets : 0;
      
      let summary = "System operating normally. ";
      
      if (issuesRatio < 0.5 && issues.length > 5) {
        summary += "Notice: Issue resolution rate is low. Consider assigning more technicians to active complaints. ";
      } else if (issuesRatio >= 0.8) {
        summary += "Great job: Resolution rate is excellent. ";
      }

      if (maintenanceRatio > 0.2) {
        summary += "Warning: More than 20% of your assets require maintenance. A proactive maintenance schedule is recommended. ";
      }

      if (totalAssets === 0) {
        summary = "Welcome to MaintainIQ! Register your first asset to get started with intelligent tracking.";
      }

      setAiSummary(summary);
      setGeneratingSummary(false);
    }, 1500); // Simulate API delay
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time asset and maintenance intelligence</p>
        </div>
        <button
          onClick={generateAISummary}
          disabled={generatingSummary}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4CC9F0]/10 border border-[#4CC9F0]/20 text-[#4CC9F0] text-sm font-medium hover:bg-[#4CC9F0]/20 transition-all duration-200 disabled:opacity-50"
        >
          {generatingSummary ? <Sparkles size={16} className="animate-pulse" /> : <Bot size={16} />}
          {generatingSummary ? 'Analyzing...' : 'AI Health Summary'}
        </button>
      </div>

      {/* AI Summary Banner */}
      {aiSummary && (
        <div className="rounded-xl bg-gradient-to-r from-[#4361EE]/20 to-[#4CC9F0]/10 border border-[#4361EE]/30 p-4 flex items-start gap-3">
          <Bot size={20} className="text-[#4CC9F0] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">AI Maintenance Insights</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{aiSummary}</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={20} className="text-[#4CC9F0]" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-[#3A506B]/20">
            {recentActions.length > 0 ? (
              recentActions.map((entry) => (
                <TimelineItem
                  key={entry.id}
                  action={entry.action}
                  timestamp={entry.timestamp}
                  type={entry.type || 'asset'}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <Activity size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity yet.</p>
                <p className="text-gray-600 text-xs mt-1">Actions will appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="rounded-2xl bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={20} className="text-[#4361EE]" />
            <h2 className="text-lg font-semibold text-white">System Health</h2>
          </div>
          <div className="space-y-4">
            {/* Health bar: resolved ratio */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Issue Resolution Rate</span>
                <span className="text-[#4ADE80] font-medium">
                  {issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0B132B]/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#4CC9F0] transition-all duration-700"
                  style={{ width: `${issues.length > 0 ? (resolvedIssues / issues.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            {/* Asset utilization */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Asset Availability</span>
                <span className="text-[#4CC9F0] font-medium">
                  {totalAssets > 0
                    ? Math.round(((totalAssets - pendingMaintenance) / totalAssets) * 100)
                    : 100}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0B132B]/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] transition-all duration-700"
                  style={{
                    width: `${totalAssets > 0 ? ((totalAssets - pendingMaintenance) / totalAssets) * 100 : 100}%`,
                  }}
                />
              </div>
            </div>
            {/* Category breakdown */}
            <div className="pt-4 border-t border-[#3A506B]/30">
              <p className="text-sm text-gray-400 mb-3">Asset Categories</p>
              <div className="space-y-2">
                {Object.entries(
                  assets.reduce((acc, a) => {
                    acc[a.category || 'Uncategorized'] = (acc[a.category || 'Uncategorized'] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{cat}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#4CC9F0]/10 text-[#4CC9F0] font-medium">
                      {count}
                    </span>
                  </div>
                ))}
                {assets.length === 0 && (
                  <p className="text-xs text-gray-600">No assets registered yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
