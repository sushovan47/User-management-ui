//App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/login/Login";
import UserDashboard from "./components/dashboard/UserDashboard";
import AdminDashboard from "./components/dashboard/AdminDashborad";
import ManagerDashboard from "./components/dashboard/ManagerDashboard";
import ForgotPassword from "./components/forgotpassword/ForgotPassword";
import ResetPassword from "./components/resetpassword/ResetPassword";
import Signup from "./components/signup/Signup";
import { useAuth } from "./AuthContext";
import { isTokenExpired } from "./service/login/loginService";
import SessionExpiredPopup from "./components/common/SessionExpiredPopup";

const roleRoutes = {
  ROLE_ADMIN: "/admin-dashboard",
  ROLE_MANAGER: "/manager-dashboard",
  ROLE_USER: "/user-dashboard",
};

// function PrivateRoute({ children }) {
//   const { user } = useAuth();
//   const location = useLocation();

//   // If no user → redirect to login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // // If user exists but token expired → redirect
//   if (isTokenExpired()) {
//     return <Navigate to="/login" replace />;
//   }

//   const expectedPath = roleRoutes[user.data.userRole];
//   if (expectedPath && location.pathname !== expectedPath) {
//     return <Navigate to={expectedPath} replace />;
//   }

//   return children;
// }

// function PrivateRoute({ children }) {
//   const { user, setSessionExpired } = useAuth();
//   const location = useLocation();

//   // Redirect logic if anyone try to enter dashboard
//   if (!user) return <Navigate to="/login" replace />;
//   // if (isTokenExpired()) return <Navigate to="/login" replace />;

//   const expectedPath = roleRoutes[user.data.userRole];
//   console.log('URL Path ', expectedPath);
//   if (expectedPath && location.pathname !== expectedPath) {
//     return <Navigate to={expectedPath} replace />;
//   }
//   const limit = 600000; // 10 minutes
//   const reset = () => {
//     localStorage.setItem("tokenExpiration", Date.now() + limit);
//   }
//   // Timer logic - Only runs once the user is confirmed as authenticated
//   useEffect(() => {
//     reset(); // Initial set
//     //  const expectedPath = roleRoutes[user.data.userRole];
//     // const events = ['mousedown', 'keydown', 'scroll'];
//     // events.forEach(e => window.addEventListener(e, reset));

//     const interval = setInterval(() => {
//       if (Date.now() > Number(localStorage.getItem("tokenExpiration"))) {
//         setSessionExpired(true);
//         clearInterval(interval);
//       }
//     }, 1000);

//     return () => {
//       // events.forEach(e => window.removeEventListener(e, reset));
//       clearInterval(interval);
//     };
//   }, [setSessionExpired]);

//   return children;
// }
function PrivateRoute({ children }) {
  const { user, setSessionExpired } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const expectedPath = roleRoutes[user.data.userRole];
  if (expectedPath && location.pathname !== expectedPath) {
    return <Navigate to={expectedPath} replace />;
  }

  useEffect(() => {
    const limit = 600000; // 10 minutes

    const reset = () => {
      // Store as ms (simpler for math)
      localStorage.setItem("tokenExpiration", Date.now() + limit);
    };

    reset();

    // Add activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset));

    const interval = setInterval(() => {
      const expiry = Number(localStorage.getItem("tokenExpiration"));
      const remainingSeconds = Math.floor((expiry - Date.now()) / 1000);

      if (Date.now() > expiry) {
        setSessionExpired(true);
        clearInterval(interval);
      } else {
        console.log(`Time remaining: ${remainingSeconds} seconds`);
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearInterval(interval);
    };
  }, [setSessionExpired]);

  return children;
}

function App() {
  const { sessionExpired, setSessionExpired } = useAuth();
  console.log("Is session expired? ", sessionExpired);

  const auth = useAuth();
  console.log("Full Auth Object:", auth);

  const handlePopupClose = () => {
    setSessionExpired(false);
    localStorage.clear(); // Clear all session data
    window.location.href = "/login";
  };

  return (
    <>
      {sessionExpired && <SessionExpiredPopup onClose={handlePopupClose} />}
      <Routes>
        {/* Can Access with out using Guard */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Can access with using Auth Guard and Session Time out*/}
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/manager-dashboard" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
        <Route path="/user-dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        {/* Will be redirected to login page if anyone try to login the dashboard page */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
