"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { userAPI } from "./services/api"; // Update this path to match your project structure
import { useRefreshStore } from "./shared-store"; // Import the shared store
import {
  User,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Search,
  UserPlus,
} from "lucide-react";

const UserManagement = () => {
  // Use the shared store for refreshing state and data cache
  const {
    isRefreshing,
    setRefreshing,
    lastRefresh,
    setLastRefresh,
    dataCache,
    updateDataCache,
  } = useRefreshStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [searchText, setSearchText] = useState(""); // Search text for filtering
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "collector",
  });
  const [formErrors, setFormErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const abortControllerRef = useRef(null);

  // Memoized function to format date
  const formatDate = useMemo(() => {
    return (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleString();
    };
  }, []);

  // Fetch users data and update the cache - optimized with the dashboard pattern
  const fetchUsersData = useCallback(
    async (signal, forceRefresh = false) => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return null;
        }

        // Check if this is an initial load (no data yet)
        const isInitialLoad = users.length === 0;

        // Only show full loading state when there's no data yet
        if (isInitialLoad) {
          setLoading(true);
        } else {
          // For subsequent loads, use background refreshing
          setRefreshing(true);
        }

        setError(null);

        // First, get the current user info
        let currentUserData = null;
        try {
          const userResponse = await userAPI.getCurrentUser(signal);
          if (userResponse && userResponse.user) {
            currentUserData = userResponse.user;
          }
        } catch (userErr) {
          if (userErr.name !== "AbortError") {
            console.error("Error fetching current user:", userErr);
          }
          // Continue with the users list even if we can't get the current user directly
        }

        // Fetch users data
        const response = await userAPI.getAllUsers(signal);

        // The backend returns users with role in the response directly
        const processedUsers = response;

        // If we couldn't get the current user directly, try to find it in the users list
        if (!currentUserData) {
          // Find the current user by comparing with stored email or ID
          const userEmail = localStorage.getItem("userEmail");
          const userId = localStorage.getItem("userId");

          if (userEmail) {
            currentUserData = processedUsers.find(
              (user) => user.email === userEmail
            );
          }

          if (!currentUserData && userId) {
            const parsedUserId = Number.parseInt(userId);
            currentUserData = processedUsers.find(
              (user) => user.id === parsedUserId
            );
          }

          // If we still don't have a current user, try to get it from the auth token
          if (!currentUserData) {
            // IMPORTANT: As a fallback, let's assume the first admin user is the current user
            // This is just for testing - in production you should use a proper method
            const adminUser = processedUsers.find(
              (user) => user.role === "admin"
            );
            if (adminUser) {
              currentUserData = adminUser;

              // Store the user info in localStorage for future use
              localStorage.setItem("userEmail", adminUser.email);
              localStorage.setItem("userId", adminUser.id.toString());
            }
          }
        }

        // Determine if current user is admin based on the fetched data
        const isAdmin = currentUserData?.role === "admin";

        // Update the shared store with the users data
        updateDataCache({ users: processedUsers });

        setIsCurrentUserAdmin(isAdmin);
        setCurrentUser(currentUserData);
        setUsers(processedUsers);

        // Always turn off loading states when done
        setLoading(false);
        setRefreshing(false);

        // Update last refresh timestamp
        setLastRefresh(new Date());

        return processedUsers;
      } catch (err) {
        // Only set error if not an abort error (which happens during cleanup)
        if (err.name !== "AbortError") {
          console.error("Error fetching users:", err);
          setError("Failed to fetch data: " + err.message);

          // Check if this is an initial load (no data yet)
          const isInitialLoad = users.length === 0;

          // Reset the appropriate loading state
          if (isInitialLoad) {
            setLoading(false);
          } else {
            setRefreshing(false);
          }
        }
        return null;
      }
    },
    [users.length, setRefreshing, setLastRefresh, updateDataCache]
  );

  // Initial data load with AbortController for cleanup
  useEffect(() => {
    // Check if we have data in the cache first
    if (dataCache.users && dataCache.users.length > 0) {
      console.log("UserManagement: Using cached users data");
      setUsers(dataCache.users);
      setLoading(false);
    }

    const controller = new AbortController();
    const signal = controller.signal;

    // Initial data fetch
    fetchUsersData(signal, true);

    return () => {
      controller.abort();
    };
  }, []);

  // Process data when it changes
  useEffect(() => {
    if (users.length > 0) {
      // Any additional processing can be done here
      // For example, sorting or grouping users
    }
  }, [users]);

  // Add polling mechanism to check for data changes - same as dashboard
  useEffect(() => {
    // Set up polling interval to check for new data
    const pollInterval = setInterval(() => {
      // Only poll if not already refreshing
      if (!isRefreshing) {
        // Create a new AbortController for this request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Set background refreshing state
        setRefreshing(true);

        // Fetch fresh data
        fetchUsersData(signal, false)
          .then(() => {
            // Update last refresh timestamp
            setLastRefresh(new Date());
          })
          .catch((err) => {
            // Only log error if not an abort error
            if (err.name !== "AbortError") {
              console.error("Error during auto-refresh:", err);
            }
          })
          .finally(() => {
            setRefreshing(false);
          });
      }
    }, 60000); // Poll every 60 seconds

    return () => {
      clearInterval(pollInterval);
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isRefreshing, fetchUsersData, setRefreshing, setLastRefresh]);

  // Delete user function - optimized with AbortController
  const deleteUser = async (userId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        showToast("Authorization token not found.", "error");
        return;
      }

      // Check if current user has admin role
      if (!isCurrentUserAdmin) {
        showToast("Only administrators can delete users.", "error");
        return;
      }

      // Create a new AbortController for this request
      const controller = new AbortController();
      const signal = controller.signal;

      // Show background refreshing state
      setRefreshing(true);

      await userAPI.deleteUser(userId, signal);

      showToast("User deleted successfully.", "success");

      // Update local state
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);

      // Update the cache
      updateDataCache({ users: updatedUsers });

      setDeleteConfirmId(null);
      setRefreshing(false);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error deleting user:", err);
        showToast("Failed to delete user: " + err.message, "error");
        setRefreshing(false);
      }
    }
  };

  // Update user role function - optimized with AbortController
  const updateUserRole = async (userId, newRole) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        showToast("Authorization token not found.", "error");
        return;
      }

      // Check if current user has admin role
      if (!isCurrentUserAdmin) {
        showToast("Only administrators can update user roles.", "error");
        return;
      }

      // Validate role before sending to API
      if (!["admin", "collector", "planner"].includes(newRole)) {
        showToast(
          `Invalid role: ${newRole}. Role must be admin, collector, or planner.`,
          "error"
        );
        return;
      }

      // Create a new AbortController for this request
      const controller = new AbortController();
      const signal = controller.signal;

      // Show background refreshing state
      setRefreshing(true);

      // Send the update using our API service
      await userAPI.updateUserRole(userId, newRole, signal);

      showToast("User role updated successfully.", "success");

      // Update the local state to reflect the change
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      );

      setUsers(updatedUsers);

      // Update the cache
      updateDataCache({ users: updatedUsers });

      setEditingUserId(null); // Exit editing mode after update
      setRefreshing(false);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error updating role:", err);
        showToast(`Failed to update user role: ${err.message}`, "error");
        setRefreshing(false);
      }
    }
  };

  // Handle Search functionality
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Memoized filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [users, searchText]);

  // Handle modal visibility and form submission
  const showAddUserModal = () => {
    // Check if current user has admin role
    if (!isCurrentUserAdmin) {
      showToast("Only administrators can add new users.", "error");
      return;
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormValues({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "collector",
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.name) errors.name = "Name is required";
    if (!formValues.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formValues.email))
      errors.email = "Email is invalid";
    if (!formValues.password) errors.password = "Password is required";
    if (!formValues.password_confirmation)
      errors.password_confirmation = "Please confirm password";
    else if (formValues.password !== formValues.password_confirmation)
      errors.password_confirmation = "Passwords do not match";
    if (!formValues.role) errors.role = "User role is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        showToast("Authorization token not found.", "error");
        return;
      }

      // Check if current user has admin role
      if (!isCurrentUserAdmin) {
        showToast("Only administrators can add new users.", "error");
        return;
      }

      // Create a new AbortController for this request
      const controller = new AbortController();
      const signal = controller.signal;

      // Show background refreshing state
      setRefreshing(true);

      // Include role in the request
      const userData = {
        ...formValues,
      };

      await userAPI.createUser(userData, signal);

      showToast("User added successfully.", "success");
      setIsModalVisible(false);
      setFormValues({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "collector",
      });

      // Refresh the user list
      await fetchUsersData(signal, false);
      setRefreshing(false);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error adding user:", err);
        const errorMessage = err.message || "Failed to add user.";
        showToast(errorMessage, "error");
        setRefreshing(false);
      }
    }
  };

  // Replace the simple alert with a more user-friendly toast
  const showToast = (message, type = "info") => {
    // Create a toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
      type === "success"
        ? "bg-green-100 text-green-800 border border-green-300"
        : type === "error"
        ? "bg-red-100 text-red-800 border border-red-300"
        : "bg-blue-100 text-blue-800 border border-blue-300"
    }`;

    toast.innerHTML = message;
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-500");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  };

  // Helper function to get the role display value
  const getUserRole = (user) => {
    return user.role || "user";
  };

  // Helper function to get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "collector":
        return "bg-green-100 text-green-800";
      case "planner":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      <div className="p-4 pb-32 bg-white rounded-lg">
        {/* Header with title and search */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800">
                User Management
                {isCurrentUserAdmin && (
                  <span className="px-2 py-1 ml-2 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                    Admin Access
                  </span>
                )}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Background refresh indicator */}
              {isRefreshing && (
                <div className="inline-flex items-center p-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
              {/* Last refresh time indicator */}
              <div className="inline-flex items-center p-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchText}
                onChange={handleSearchChange}
                className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={showAddUserModal}
              disabled={!isCurrentUserAdmin}
              className={`px-4 py-2 rounded-md flex items-center whitespace-nowrap ${
                isCurrentUserAdmin
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            >
              <UserPlus className="w-5 h-5 mr-1" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && users.length === 0 && (
          <div className="p-4">
            {/* Loading skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                        <div className="w-1/2 h-3 mt-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-24 h-6 bg-gray-200 rounded"></div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Users List - Mobile-friendly card view */}
        {(!loading || users.length > 0) && !error && (
          <div className="space-y-4">
            {filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No users found</p>
                <p className="mt-1 text-sm">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <>
                {/* Desktop view - Table */}
                <div className="hidden overflow-x-auto rounded-lg shadow md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="text-white bg-green-600">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase"
                        >
                          Role
                        </th>
                        {isCurrentUserAdmin && (
                          <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase"
                          >
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((user, index) => (
                        <tr
                          key={user.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUserId === user.id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={newRole}
                                  onChange={(e) => setNewRole(e.target.value)}
                                  className="block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                >
                                  <option value="collector">Collector</option>
                                  <option value="admin">Admin</option>
                                  <option value="planner">Planner</option>
                                </select>
                                <button
                                  onClick={() =>
                                    updateUserRole(user.id, newRole)
                                  }
                                  className="inline-flex items-center p-1 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="inline-flex items-center p-1 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                                    getUserRole(user)
                                  )}`}
                                >
                                  {getUserRole(user)}
                                </span>
                                {isCurrentUserAdmin && (
                                  <button
                                    onClick={() => {
                                      setEditingUserId(user.id);
                                      setNewRole(getUserRole(user));
                                    }}
                                    className="ml-2 text-yellow-500 hover:text-yellow-700"
                                    title="Edit User Role"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          {isCurrentUserAdmin && (
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                              {deleteConfirmId === user.id ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <span className="text-xs text-red-600">
                                    Confirm?
                                  </span>
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="p-1 text-white bg-red-600 rounded hover:bg-red-700"
                                    title="Confirm Delete"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="p-1 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                    title="Cancel Delete"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view - Cards */}
                <div className="pb-20 space-y-4 md:hidden overflow-y-auto max-h-[70vh]">
                  {filteredData.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 bg-white border rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 text-white bg-green-600 rounded-full">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 h-fit py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            getUserRole(user)
                          )}`}
                        >
                          {getUserRole(user)}
                        </span>
                      </div>

                      {isCurrentUserAdmin && (
                        <div className="flex justify-end pt-3 mt-4 border-t border-gray-100">
                          {editingUserId === user.id ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="collector">Collector</option>
                                <option value="admin">Admin</option>
                                <option value="planner">Planner</option>
                              </select>
                              <div className="flex justify-end w-full gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    updateUserRole(user.id, newRole)
                                  }
                                  className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setNewRole(getUserRole(user));
                                }}
                                className="p-2 text-yellow-500 rounded-md bg-yellow-50 hover:bg-yellow-100"
                                title="Edit Role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {deleteConfirmId === user.id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                                    title="Confirm Delete"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="p-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                                    title="Cancel Delete"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(user.id)}
                                  className="p-2 text-red-500 rounded-md bg-red-50 hover:bg-red-100"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Add User Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Add User
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleAddUser} className="mt-4">
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full py-2 px-3 border ${
                          formErrors.name ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full py-2 px-3 border ${
                          formErrors.email
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formValues.password}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full py-2 px-3 border ${
                          formErrors.password
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      />
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="password_confirmation"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="password_confirmation"
                        id="password_confirmation"
                        value={formValues.password_confirmation}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full py-2 px-3 border ${
                          formErrors.password_confirmation
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      />
                      {formErrors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.password_confirmation}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Role
                      </label>
                      <select
                        name="role"
                        id="role"
                        value={formValues.role}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full py-2 px-3 border ${
                          formErrors.role ? "border-red-300" : "border-gray-300"
                        } bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      >
                        <option value="collector">Collector</option>
                        <option value="admin">Admin</option>
                        <option value="planner">Planner</option>
                      </select>
                      {formErrors.role && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.role}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                      >
                        Add User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
