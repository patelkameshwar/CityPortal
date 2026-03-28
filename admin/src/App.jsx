import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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
import EventDashboard from "./pages/Admin/EventDashboard.jsx";
import TourismManagement from "./pages/Admin/TourismManagement.jsx";
import ManageBooking from "./pages/Client/ManageBooking.jsx";
import MyHotels from "./pages/Client/MyHotels.jsx";
import AddHotel from "./pages/Client/AddHotel.jsx";
import MyEvents from "./pages/Client/MyEvents.jsx";
import AddEvent from "./pages/Client/AddEvent.jsx";
import EditItems from "./pages/EditItems.jsx";
import ViewItems from "./pages/ViewItems.jsx";
import AddTourism from "./pages/Admin/AddTourism.jsx";
import AdminView from "./pages/Admin/AdminView.jsx";
import AdminEdit from "./pages/Admin/AdminEdit.jsx";
import ManageBlogs from "./pages/Admin/ManageBlogs.jsx";
import AddBlog from "./pages/Admin/AddBlog.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const RootRedirect = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">Loading...</div>;
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (isAuthenticated && user?.role === 'client') {
    return <Navigate to="/client-dashboard" replace />;
  }

  return <Login />;
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer />
        <Routes>
<Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
            <Route
            path="/admin/clients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageBlogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-blog"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageHotels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/view-profile"
            element={
              <ProtectedRoute allowedRoles={['client']}>
            <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ManageBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/my-hotels"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <MyHotels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/my-events"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/add-hotel"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <AddHotel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/add-event"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <AddEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/edit/:type/:id"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <EditItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/edit-event/:id"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <EditItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/view-items/:type/:id"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ViewItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EventDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tourism"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TourismManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-tourism"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddTourism />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/view/:type/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:type/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEdit />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;

