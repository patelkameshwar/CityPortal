import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ClientDashboard from "./pages/Client/ClientDashboard.jsx";
import ManageClients from "./pages/Admin/ManageClients.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import ManageHotels from "./pages/Admin/ManageHotels.jsx";
import ViewProfile from "./pages/Client/ViewProfile.jsx";


const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
            <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute>
                <ManageClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels"
            element={
              <ProtectedRoute>
                <ManageHotels />
              </ProtectedRoute>
            }
          />
<Route
            path="/client/view-profile"
            element={
              <ProtectedRoute>
                <ViewProfile />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
