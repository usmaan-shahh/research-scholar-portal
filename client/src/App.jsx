import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./routes/PrivateRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import OfficeStaffDashboard from "./components/dashboards/OfficeStaffDashboard";
import DRCChairDashboard from "./components/dashboards/DRCChairDashboard";
import FacultyDashboard from "./components/dashboards/FacultyDashboard";
import Login from "./components/auth/Login";
import ChangePassword from "./components/auth/ChangePassword";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Password Change Route - Must be before other protected routes */}
          <Route
            path="/change-password"
            element={
              <PrivateRoute
                allowedRoles={[
                  "admin",
                  "main_office",
                  "office_staff",
                  "supervisor",
                ]}
              >
                <ChangePassword />
              </PrivateRoute>
            }
          />

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
            path="/office-staff/*"
            element={
              <PrivateRoute allowedRoles={["office_staff", "main_office"]}>
                <OfficeStaffDashboard />
              </PrivateRoute>
            }
          />

          {/* Faculty Dashboard Route */}
          <Route
            path="/supervisor/*"
            element={
              <PrivateRoute allowedRoles={["supervisor"]}>
                <FacultyDashboard />
              </PrivateRoute>
            }
          />

          {/* DRC Chair Route */}
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
