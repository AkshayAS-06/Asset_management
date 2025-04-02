import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Dashboard from "./components/Dashboard.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [userRole, setUserRole] = useState(user?.role); // Set user role

  // Store token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Store user data in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setUserRole(user.role); // Update user role
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* Default route: redirect to appropriate dashboard based on role */}
        <Route
          path="/"
          element={token ? (
            userRole === "STUDENT" ? (
              <Navigate to="/student-dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )}
        />

        {/* Login route */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login setToken={setToken} setUser={setUser} />}
        />
        
        {/* Signup route */}
        <Route
          path="/signup"
          element={token ? <Navigate to="/" /> : <Signup setToken={setToken} setUser={setUser} />}
        />
        
        {/* Dashboard route (Admin) */}
        <Route
          path="/dashboard"
          element={token && userRole !== "STUDENT" ? (
            <Dashboard user={user} setToken={setToken} setUser={setUser} />
          ) : (
            <Navigate to="/login" />
          )}
        />
        
        {/* Student Dashboard route */}
        <Route
          path="/student-dashboard"
          element={token && userRole === "STUDENT" ? (
            <StudentDashboard user={user} />
          ) : (
            <Navigate to="/login" />
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;