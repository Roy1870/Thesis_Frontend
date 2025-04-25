"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AddData from "./components/AddData";
import Inventory from "./components/Inventory";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Profile from "./components/Profile";
import UserManagement from "./components/UserManagement";

const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";

function App() {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Check if token is in localStorage

  // Get initial collapsed state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return savedState ? JSON.parse(savedState) : false;
  });

  // Check if we're on mobile
  const isMobile = () => window.innerWidth < 768;
  const [mobile, setMobile] = useState(isMobile());

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);

    // Check for changes to localStorage directly
    const checkLocalStorage = () => {
      const currentState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (currentState) {
        const parsedState = JSON.parse(currentState);
        if (parsedState !== sidebarCollapsed) {
          setSidebarCollapsed(parsedState);
        }
      }
    };

    // Check localStorage periodically
    const interval = setInterval(checkLocalStorage, 500);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);

  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex flex-col h-screen overflow-hidden md:flex-row">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div
            className={`flex-1 overflow-hidden transition-all duration-300 w-full`}
            style={{
              marginLeft: mobile ? "0" : sidebarCollapsed ? "80px" : "256px",
              width: mobile
                ? "100%"
                : `calc(100% - ${sidebarCollapsed ? "80px" : "256px"})`,
              marginTop: mobile ? "14px" : "0",
            }}
          >
            <main className="flex flex-col flex-1 h-screen m-0 overflow-hidden bg-white">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-data" element={<AddData />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/profile" element={<Profile />} />

                {/* Redirect unknown paths to Dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
          {/* Redirect unknown paths to Login */}
        </Routes>
      )}
    </Router>
  );
}

export default App;
