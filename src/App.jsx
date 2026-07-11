import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Slidebar from './components/Slidebar';
import DashboardHome from './pages/DashboardHome';
import AssetManagement from './pages/AssetManagement';
import IssueTriage from './pages/IssueTriage';
import PublicAssetPortal from './pages/PublicAssetPortal';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

function PrivateLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0B132B] overflow-hidden">
      <Slidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Ambient background gradients */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#4CC9F0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-1/3 w-[400px] h-[400px] bg-[#4361EE]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return <PrivateLayout>{children}</PrivateLayout>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#4CC9F0]" />
          <p className="text-gray-400 text-sm">Loading MaintainIQ...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/public/asset/:assetId" element={<PublicAssetPortal />} />

        {/* Private Routes */}
        <Route path="/" element={<PrivateRoute user={user}><DashboardHome /></PrivateRoute>} />
        <Route path="/assets" element={<PrivateRoute user={user}><AssetManagement /></PrivateRoute>} />
        <Route path="/issues" element={<PrivateRoute user={user}><IssueTriage /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
