import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./routes/PrivateRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import ScholarDashboard from "./components/dashboards/ScholarDashboard";
import SupervisorDashboard from "./components/dashboards/SupervisorDashboard";
import OfficeStaffDashboard from "./components/dashboards/OfficeStaffDashboard";
import DRCStaffDashboard from "./components/dashboards/DRCStaffDashboard";
import HeadDashboard from "./components/dashboards/HeadDashboard";
import SRACMemberDashboard from "./components/dashboards/SRACMemberDashboard";
import DRCChairDashboard from "./components/dashboards/DRCChairDashboard";
import Login from "./components/auth/Login";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/scholar/*"
            element={
              <PrivateRoute allowedRoles={["scholar"]}>
                <ScholarDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/supervisor/*"
            element={
              <PrivateRoute allowedRoles={["supervisor"]}>
                <SupervisorDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/office-staff/*"
            element={
              <PrivateRoute allowedRoles={["office_staff"]}>
                <OfficeStaffDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/drc-staff/*"
            element={
              <PrivateRoute allowedRoles={["drc_member"]}>
                <DRCStaffDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/head/*"
            element={
              <PrivateRoute allowedRoles={["head"]}>
                <HeadDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/srac-member/*"
            element={
              <PrivateRoute allowedRoles={["srac_member"]}>
                <SRACMemberDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/drc-chair/*"
            element={
              <PrivateRoute allowedRoles={["drc_chair"]}>
                <DRCChairDashboard />
              </PrivateRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
