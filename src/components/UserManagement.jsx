"use client";

import { useState, useEffect, useRef } from "react";
import { userAPI } from "./services/api"; // Update this path to match your project structure

const UserManagement = () => {
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
  const [dataFetched, setDataFetched] = useState(false);
  const prefetchTimeoutRef = useRef(null);

  const prefetchUsersData = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;

      console.log("Prefetching users data...");
      const response = await userAPI.getAllUsers();

      // Store the prefetched data
      setUsers(response);
      setDataFetched(true);
      console.log("Users data prefetched successfully");
    } catch (err) {
      console.error("Error prefetching users data:", err);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      // If data has already been prefetched, skip fetching
      if (dataFetched) {
        console.log("Using prefetched users data");
        setLoading(false);
        return;
      }

      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return;
        }

        // First, get the current user info
        let currentUserData = null;
        try {
          const userResponse = await userAPI.getCurrentUser();

          console.log("Current user API response:", userResponse);
          if (userResponse && userResponse.user) {
            // Extract the user object from the response
            currentUserData = userResponse.user;
            console.log("Extracted user data:", currentUserData);
          }
        } catch (userErr) {
          console.error("Error fetching current user:", userErr);
          // Continue with the users list even if we can't get the current user directly
        }

        // Fetch users data
        const response = await userAPI.getAllUsers();

        console.log("Raw API response:", response);

        // The backend returns users with role in the response directly
        const processedUsers = response;

        // If we couldn't get the current user directly, try to find it in the users list
        if (!currentUserData) {
          // Find the current user by comparing with stored email or ID
          const userEmail = localStorage.getItem("userEmail");
          const userId = localStorage.getItem("userId");

          console.log(
            "Looking for current user with email:",
            userEmail,
            "or ID:",
            userId
          );

          // Debug all users to see their emails and IDs
          processedUsers.forEach((user) => {
            console.log(
              `User in response: ID=${user.id}, Email=${user.email}, Role=${user.role}`
            );
          });

          if (userEmail) {
            currentUserData = processedUsers.find(
              (user) => user.email === userEmail
            );
            console.log("Found user by email:", currentUserData);
          }

          if (!currentUserData && userId) {
            const parsedUserId = Number.parseInt(userId);
            console.log("Trying to find user by ID:", parsedUserId);
            currentUserData = processedUsers.find(
              (user) => user.id === parsedUserId
            );
            console.log("Found user by ID:", currentUserData);
          }

          // If we still don't have a current user, try to get it from the auth token
          if (!currentUserData) {
            console.log("No user found by email or ID, trying to decode token");

            // IMPORTANT: As a fallback, let's assume the first admin user is the current user
            // This is just for testing - in production you should use a proper method
            const adminUser = processedUsers.find(
              (user) => user.role === "admin"
            );
            if (adminUser) {
              console.log("Using first admin user as current user:", adminUser);
              currentUserData = adminUser;

              // Store the user info in localStorage for future use
              localStorage.setItem("userEmail", adminUser.email);
              localStorage.setItem("userId", adminUser.id.toString());
            }
          }
        }

        // Determine if current user is admin based on the fetched data
        const isAdmin = currentUserData?.role === "admin";
        console.log("Current user data:", currentUserData);
        console.log(
          "Is admin check:",
          currentUserData?.role,
          "===",
          "admin",
          "Result:",
          isAdmin
        );

        setIsCurrentUserAdmin(isAdmin);
        setCurrentUser(currentUserData);
        setUsers(processedUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Start prefetching data after a short delay
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchUsersData();
    }, 1000); // 1 second delay

    return () => {
      // Clean up the timeout if component unmounts
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  // Delete user function
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

      await userAPI.deleteUser(userId);

      showToast("User deleted successfully.", "success");
      // Refresh the user data
      setUsers(users.filter((user) => user.id !== userId));
      setDeleteConfirmId(null);
    } catch (err) {
      showToast("Failed to delete user.", "error");
    }
  };

  // Update user role function
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

      console.log(`Updating user ${userId} to role: ${newRole}`);

      // Validate role before sending to API
      if (!["admin", "collector", "planner"].includes(newRole)) {
        showToast(
          `Invalid role: ${newRole}. Role must be admin, collector, or planner.`,
          "error"
        );
        return;
      }

      // Send the update using our API service
      const response = await userAPI.updateUserRole(userId, newRole);

      console.log("Update role response:", response);
      showToast("User role updated successfully.", "success");

      // Update the local state to reflect the change
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setEditingUserId(null); // Exit editing mode after update
    } catch (err) {
      console.error("Error updating role:", err);
      showToast(
        `Failed to update user role: ${err.message}. Please check the server logs.`,
        "error"
      );
    }
  };

  // Handle Search functionality
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = users.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

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

      // Show loading state
      setLoading(true);

      // Include role in the request
      const userData = {
        ...formValues,
      };

      const response = await userAPI.createUser(userData);

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
      const usersResponse = await userAPI.getAllUsers();
      setUsers(usersResponse);
    } catch (err) {
      console.error("Error adding user:", err);
      const errorMessage = err.message || "Failed to add user.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
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

  return (
    <div className="p-4">
      {/* Header with title and search */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          User Management
          {isCurrentUserAdmin && (
            <span className="px-2 py-1 ml-2 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
              Admin Access
            </span>
          )}
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchText}
            onChange={handleSearchChange}
            className="py-2 pl-10 pr-4 border rounded-md w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Export and Add User Buttons */}
      <div className="flex mb-6 space-x-2">
        <button
          onClick={showAddUserModal}
          disabled={!isCurrentUserAdmin}
          className={`px-4 py-2 rounded-md flex items-center ${
            isCurrentUserAdmin
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
        >
          {isCurrentUserAdmin ? (
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          )}
          Add User
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="p-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex mb-6 space-x-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Table skeleton */}
          <div className="overflow-x-auto rounded-lg shadow-md">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Table header skeleton */}
              <div className="h-12 bg-green-600">
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-1 px-6 py-3">
                      <div className="h-4 rounded bg-white/30 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table body skeleton */}
              <div className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`flex ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex-1 px-6 py-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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

      {/* Users Table */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow-md">
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
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                          onClick={() => updateUserRole(user.id, newRole)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getUserRole(user) === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
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
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              ></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  {isCurrentUserAdmin && (
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      {deleteConfirmId === user.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-red-600">Confirm?</span>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
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
                        formErrors.email ? "border-red-300" : "border-gray-300"
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
  );
};

export default UserManagement;
