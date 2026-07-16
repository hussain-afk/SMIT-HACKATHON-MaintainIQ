import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthPage from "../pages/AuthPage";
import AdminDashboard from "../pages/adminFrontend/Dashboard";
import TechDashboard from "../pages/techFrontend/Dashboard";
import AssetDetail from "../pages/public/AssetDetail";
import Docs from "../pages/docs/Docs";
import { StoreContext } from "../context/Store";
import LoadingSpinner from "../components/LoadingSpinner";

function Routing() {
   const { user, isAdmin, authChecked } = useContext(StoreContext);

   // FIX: before, the app would decide "is this person logged in?" using a
   // value that always started as `null`/false, so on every page refresh it
   // flashed the login page for a moment - even for people who WERE logged
   // in - before catching up. Now we wait for Firebase to finish checking
   // ("authChecked") before deciding where to send anyone.
   if (!authChecked) {
      return (
         <div className="min-h-screen bg-[#0B132B] flex items-center justify-center">
            <LoadingSpinner message="Checking your session..." />
         </div>
      );
   }

   return (
      <Routes>
         <Route path="/" element={<AuthPage />} />
         <Route path="/admin/dashboard" element={user && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
         <Route path="/tech/dashboard" element={user && !isAdmin ? <TechDashboard /> : <Navigate to="/" />} />
         <Route path="/tech/asset/:id" element={<AssetDetail />} />
         <Route path="/docs" element={<Docs />} />
      </Routes>
   );
}
export default Routing;
