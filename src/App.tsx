import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Pipeline from "@/pages/Pipeline";
import Deals from "@/pages/Deals";
import Tasks from "@/pages/Tasks";
import Login from "@/pages/Login";
import UserProfile from "@/pages/UserProfile";
import { useCRMStore } from "@/store/crmStore";
export default function App() {
    const hydrate = useCRMStore((s) => s.hydrateFromApi);
    const currentUser = useCRMStore((s) => s.currentUser);
    useEffect(() => {
        void hydrate();
    }, [hydrate]);
    return (<Router>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
        <Route element={currentUser ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />}/>
          <Route path="/customers" element={<Customers />}/>
          <Route path="/customers/:id" element={<CustomerDetail />}/>
          <Route path="/pipeline" element={<Pipeline />}/>
          <Route path="/deals" element={<Deals />}/>
          <Route path="/tasks" element={<Tasks />}/>
          <Route path="/profile" element={<UserProfile />}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Route>
      </Routes>
    </Router>);
}
