"use client";

import { useState, useEffect } from "react";
import {
  DashboardOutlined,
  FormOutlined,
  InboxOutlined,
  LineChartOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  LogoutOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../images/logo.png";
import axios from "axios";
// Add this at the top of the file, after the imports
import { prefetchRouteData, prefetchCriticalData } from "./services/api";

const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";

const Sidebar = () => {
  const location = useLocation();
  // Initialize collapsed state from localStorage or default to false
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return savedState ? JSON.parse(savedState) : false;
  });
  const [selectedKey, setSelectedKey] = useState(location.pathname);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [prefetchedRoutes, setPrefetchedRoutes] = useState({}); // Track which routes have been prefetched
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");

  // Update selected key when location changes
  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location]);

  // Check if we're on mobile
  const isMobile = () => window.innerWidth < 768;
  const [mobile, setMobile] = useState(isMobile());

  // Fetch user data and check admin status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setLoading(false);
          return;
        }

        // Get current user info from API
        const userResponse = await axios.get(
          "https://thesis-backend-tau.vercel.app/api/api/user",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        console.log("User API response:", userResponse.data);

        // Extract user data from the nested response
        if (userResponse.data && userResponse.data.user) {
          const userData = userResponse.data.user;

          // Set user name from API response
          setUserName(userData.name || "User");

          // Check if user is admin
          const adminStatus = userData.role === "admin";

          setIsAdmin(adminStatus);

          // Store in localStorage for other components
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("userId", userData.id.toString());
          localStorage.setItem("userName", userData.name);
          localStorage.setItem("role", userData.role);

          // Set user role from API response
          setUserRole(userData.role || "");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
      if (!isMobile() && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Initial prefetch of critical data
  useEffect(() => {
    // Prefetch critical data when sidebar loads
    prefetchCriticalData();
  }, []);

  const toggleSidebar = () => {
    if (mobile) {
      // On mobile, toggle the mobile menu
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      // On desktop, toggle the collapsed state
      const newCollapsedState = !collapsed;
      setCollapsed(newCollapsedState);
      // Save to localStorage so App component can access it
      localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        JSON.stringify(newCollapsedState)
      );
      // Dispatch custom event so App can react to changes
      window.dispatchEvent(
        new CustomEvent("sidebarToggle", {
          detail: { collapsed: newCollapsedState },
        })
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");

    // Custom message implementation
    const messageDiv = document.createElement("div");
    messageDiv.className =
      "fixed z-50 flex items-center px-4 py-3 text-green-700 bg-green-100 border border-green-400 rounded top-4 right-4";
    messageDiv.innerHTML = `
      <span class="mr-2">
        <svg viewBox="64 64 896 896" data-icon="check-circle" width="1em" height="1em" fill="#52c41a" aria-hidden="true" focusable="false">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
        </svg>
      </span>
      <span>Logout success!</span>
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      document.body.removeChild(messageDiv);
      window.location.reload();
    }, 2000);
  };

  // Enhanced menu click handler with intelligent prefetching
  const handleMenuClick = (path) => {
    setSelectedKey(path);

    // Check if we've already prefetched this route
    if (!prefetchedRoutes[path]) {
      // Prefetch data for the route being navigated to
      console.log(`Prefetching data for route: ${path}`);
      prefetchRouteData(path);

      // Mark this route as prefetched
      setPrefetchedRoutes((prev) => ({
        ...prev,
        [path]: true,
      }));

      // Also prefetch related routes that might be visited next
      setTimeout(() => {
        // Determine related routes based on current selection
        const relatedRoutes = getRelatedRoutes(path);

        // Prefetch each related route with a small delay between each
        relatedRoutes.forEach((route, index) => {
          if (!prefetchedRoutes[route]) {
            setTimeout(() => {
              console.log(`Prefetching related route: ${route}`);
              prefetchRouteData(route);

              // Update prefetched routes
              setPrefetchedRoutes((prev) => ({
                ...prev,
                [route]: true,
              }));
            }, index * 500); // 500ms between each prefetch
          }
        });
      }, 1000); // Start prefetching related routes after 1 second
    }

    // Navigate to the selected route
    navigate(path);

    if (mobile) {
      setMobileMenuOpen(false);
    }
  };

  // Helper function to determine related routes based on current route
  const getRelatedRoutes = (currentPath) => {
    switch (currentPath) {
      case "/":
        // From dashboard, users often go to inventory or analytics
        return ["/inventory", "/analytics"];
      case "/inventory":
        // From inventory, users often go to dashboard or add-data
        return ["/", "/add-data"];
      case "/analytics":
        // From analytics, users often go to dashboard or inventory
        return ["/", "/inventory"];
      case "/add-data":
        // From add-data, users often go to inventory
        return ["/inventory"];
      case "/user-management":
        // From user management, users often go to dashboard
        return ["/"];
      default:
        return ["/"];
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownVisible(!dropdownVisible);
  };

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mobile menu overlay
  const mobileMenuOverlay = (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setMobileMenuOpen(false)}
    />
  );

  // Sidebar content - reused for both mobile and desktop
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#5A8C79]">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo"
              className="w-8 h-8"
            />
            <span className="font-bold text-white">AgriTrack</span>
          </div>
        )}
        <button
          className={`text-white hover:bg-[#5A8C79] p-2 rounded ${
            collapsed && !mobile ? "mx-auto" : ""
          }`}
          onClick={toggleSidebar}
        >
          {collapsed && !mobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Welcome Message */}
      {(!collapsed || mobile) && (
        <div className="p-2 border-b border-[#5A8C79]">
          <h3 className="text-sm text-white">
            Welcome, <span className="font-bold">{userName}</span>!
          </h3>
          {isAdmin && (
            <span className="inline-block px-2 py-0.5 mt-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
              Admin Access
            </span>
          )}
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-grow overflow-y-auto">
        <ul className="py-2">
          <li>
            <button
              onClick={() => handleMenuClick("/")}
              className={`w-full flex items-center px-4 py-2 text-white hover:bg-[#5A8C79] ${
                selectedKey === "/" ? "bg-[#5A8C79]" : ""
              }`}
              onMouseEnter={() => {
                // Prefetch on hover for better responsiveness
                if (!prefetchedRoutes["/"]) {
                  prefetchRouteData("/");
                  setPrefetchedRoutes((prev) => ({ ...prev, ["/"]: true }));
                }
              }}
            >
              <DashboardOutlined className="mr-3" />
              {(!collapsed || mobile) && <span>Dashboard</span>}
            </button>
          </li>
          {localStorage.getItem("role") !== "planner" && (
            <li>
              <button
                onClick={() => handleMenuClick("/add-data")}
                className={`w-full flex items-center px-4 py-2 text-white hover:bg-[#5A8C79] ${
                  selectedKey === "/add-data" ? "bg-[#5A8C79]" : ""
                }`}
                onMouseEnter={() => {
                  // Prefetch on hover
                  if (!prefetchedRoutes["/add-data"]) {
                    prefetchRouteData("/add-data");
                    setPrefetchedRoutes((prev) => ({
                      ...prev,
                      ["/add-data"]: true,
                    }));
                  }
                }}
              >
                <FormOutlined className="mr-3" />
                {(!collapsed || mobile) && <span>Data Entry</span>}
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => handleMenuClick("/inventory")}
              className={`w-full flex items-center px-4 py-2 text-white hover:bg-[#5A8C79] ${
                selectedKey === "/inventory" ? "bg-[#5A8C79]" : ""
              }`}
              onMouseEnter={() => {
                // Prefetch on hover
                if (!prefetchedRoutes["/inventory"]) {
                  prefetchRouteData("/inventory");
                  setPrefetchedRoutes((prev) => ({
                    ...prev,
                    ["/inventory"]: true,
                  }));
                }
              }}
            >
              <InboxOutlined className="mr-3" />
              {(!collapsed || mobile) && <span>Inventory</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick("/analytics")}
              className={`w-full flex items-center px-4 py-2 text-white hover:bg-[#5A8C79] ${
                selectedKey === "/analytics" ? "bg-[#5A8C79]" : ""
              }`}
              onMouseEnter={() => {
                // Prefetch on hover
                if (!prefetchedRoutes["/analytics"]) {
                  prefetchRouteData("/analytics");
                  setPrefetchedRoutes((prev) => ({
                    ...prev,
                    ["/analytics"]: true,
                  }));
                }
              }}
            >
              <LineChartOutlined className="mr-3" />
              {(!collapsed || mobile) && <span>Analytics</span>}
            </button>
          </li>

          {/* User Management - Only visible for admin users */}
          {isAdmin && (
            <li>
              <button
                onClick={() => handleMenuClick("/user-management")}
                className={`w-full flex items-center px-4 py-2 text-white hover:bg-[#5A8C79] ${
                  selectedKey === "/user-management" ? "bg-[#5A8C79]" : ""
                }`}
                onMouseEnter={() => {
                  // Prefetch on hover
                  if (!prefetchedRoutes["/user-management"]) {
                    prefetchRouteData("/user-management");
                    setPrefetchedRoutes((prev) => ({
                      ...prev,
                      ["/user-management"]: true,
                    }));
                  }
                }}
              >
                <TeamOutlined className="mr-3" />
                {(!collapsed || mobile) && <span>User Management</span>}
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Profile Dropdown */}
      <div className="border-t border-[#5A8C79] mt-auto bg-[#6A9C89]">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className={`w-full flex items-center px-4 py-3 text-white hover:bg-[#5A8C79] ${
              selectedKey === "/profile" ? "bg-[#5A8C79]" : ""
            }`}
          >
            <UserOutlined className="mr-3" />
            {(!collapsed || mobile) && (
              <>
                <span>Profile</span>
                <span className="ml-auto">
                  {dropdownVisible ? <UpOutlined /> : <DownOutlined />}
                </span>
              </>
            )}
          </button>

          {dropdownVisible && (
            <div
              className={`${
                collapsed && !mobile
                  ? "absolute left-full bottom-0 mb-2 w-48 bg-white rounded shadow-lg z-30"
                  : "absolute left-0 z-20 w-full py-1 mb-1 bg-white rounded shadow-lg bottom-full"
              }`}
            >
              <button
                onClick={() => {
                  handleMenuClick("/profile");
                  setDropdownVisible(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <UserOutlined className="mr-2 text-gray-500" />
                <span>Profile Details</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownVisible(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <LogoutOutlined className="mr-2 text-gray-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOverlay}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#6A9C89] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex flex-col h-screen ${
          collapsed ? "w-20" : "w-64"
        } bg-[#6A9C89] transition-all duration-300 fixed left-0 top-0 z-10`}
      >
        {sidebarContent}
      </div>

      {/* Mobile header with menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#6A9C89] z-20 flex items-center px-4">
        <button className="p-2 text-white rounded-md" onClick={toggleSidebar}>
          <MenuUnfoldOutlined />
        </button>
        <div className="flex items-center ml-3">
          <img
            src={logo || "/placeholder.svg"}
            alt="Logo"
            className="w-8 h-8"
          />
          <span className="ml-2 font-bold text-white">AgriTrack</span>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="h-14 md:hidden"></div>
    </>
  );
};

export default Sidebar;
