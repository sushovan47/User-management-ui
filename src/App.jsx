import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login/Login';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashborad';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import ForgotPassword from './components/forgotpassword/ForgotPassword';
import Signup from './components/signup/Signup';
import { useAuth } from "./AuthContext"; // custom hook for auth state

const roleRoutes = {
  ROLE_ADMIN: "/admin-dashboard",
  ROLE_MANAGER: "/manager-dashboard",
  ROLE_USER: "/user-dashboard"
};

function PrivateRoute({ children }) {
  // const { user } = useAuth();
  // return user ? children : <Navigate to="/login" replace />;
  const { user } = useAuth(); // { userId, role }
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but on the wrong dashboard, redirect
  const expectedPath = roleRoutes[user.data.userRole];
  if (expectedPath && location.pathname !== expectedPath) {
    return <Navigate to={expectedPath} replace />;
  }

  return children;
}

function App() {
  const isAuthenticated = false; // Replace with your auth logic

  return (

    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager-dashboard"
        element={
          <PrivateRoute>
            <ManagerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/user-dashboard"
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App