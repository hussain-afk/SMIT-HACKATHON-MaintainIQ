import {Routes, Route} from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import AdminDashboard from "../pages/adminFrontend/Dashboard";
import TechDashboard from "../pages/techFrontend/Dashboard";
import { Heading1 } from "lucide-react";
import AssetDetail from "../pages/public/AssetDetail";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { StoreContext } from "../context/Store";
function Routing() {
   const { user, isAdmin } = useContext(StoreContext);


   return (
      <Routes>
         <Route path="/" element={<AuthPage />} />
         <Route path="/admin/dashboard" element={user && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
         <Route path="/tech/dashboard" element={user && !isAdmin ? <TechDashboard /> : <Navigate to="/" />} />
         <Route path="/tech/asset/:id" element={<AssetDetail />} />
      </Routes>
   );
}
export default Routing;
