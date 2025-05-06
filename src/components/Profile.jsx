"use client";

import { useState } from "react";
import axios from "axios";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

const Profile = () => {
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state for user data updates
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const getAuthToken = () => localStorage.getItem("authToken");

  // Initialize user data from localStorage
  const [userData, setUserData] = useState(() => {
    // Get user data directly from localStorage (same source as sidebar)
    const userName = localStorage.getItem("userName") || "User";
    const userEmail = localStorage.getItem("userEmail") || "";
    const userRole = localStorage.getItem("role") || "user";
    const userId = localStorage.getItem("userId") || "";

    return {
      name: userName,
      email: userEmail,
      role: userRole,
      id: userId,
      profile_picture: "",
    };
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Start editing mode
  const startEditing = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
      password: "",
      confirmPassword: "",
    });
    setIsEditing(true);
  };

  // Update user profile with new data
  const updateUserProfile = async (updatedData) => {
    const token = getAuthToken();

    try {
      const response = await axios.post(
        "https://thesis-backend-tau.vercel.app/api/api/user/profile",
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local storage with new values
      if (updatedData.name) {
        localStorage.setItem("userName", updatedData.name);
      }

      if (updatedData.email) {
        localStorage.setItem("userEmail", updatedData.email);
      }

      // Update state with new values
      setUserData({
        ...userData,
        name: updatedData.name || userData.name,
        email: updatedData.email || userData.email,
      });

      return response.data;
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile");
      throw err;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(false);

    // Validate form data
    if (formData.password && formData.password !== formData.confirmPassword) {
      setSaveError(true);
      setError("Passwords do not match");
      setTimeout(() => setSaveError(false), 3000);
      return;
    }

    // Prepare data for API
    const updateData = {
      name: formData.name,
      email: formData.email,
    };

    // Only include password if it was provided
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      await updateUserProfile(updateData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: userData.name,
      email: userData.email,
      password: "",
      confirmPassword: "",
    });
  };

  // Error display
  if (error && !userData.name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-red-600">
        <XCircleIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold">{error}</h2>
        <p className="mt-2">
          Please try refreshing the page or logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="flex items-center p-4 mb-6 text-green-700 bg-green-100 border border-green-400 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="flex items-center p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            <XCircleIcon className="w-5 h-5 mr-2" />
            <span>
              {error || "Failed to update profile. Please try again."}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Profile Picture Section */}
          <div className="md:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4 overflow-hidden rounded-full">
                  {userData.profile_picture ? (
                    <img
                      src={userData.profile_picture || "/placeholder.svg"}
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          userData.name
                        )}&background=6A9C89&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl text-white bg-[#6A9C89] rounded-full">
                      {userData.name
                        ? userData.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-gray-800">
                  {userData.name}
                </h2>
                <p className="text-gray-500">{userData.email}</p>

                {userData.role && (
                  <span
                    className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                      userData.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {userData.role.charAt(0).toUpperCase() +
                      userData.role.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h3>

                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-[#6A9C89] hover:bg-[#5A8C79] focus:outline-none focus:ring-2 focus:ring-[#6A9C89] focus:ring-offset-2"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="profile-form"
                      className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-[#6A9C89] hover:bg-[#5A8C79] focus:outline-none focus:ring-2 focus:ring-[#6A9C89] focus:ring-offset-2"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <form id="profile-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name Field */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={isEditing ? formData.name : userData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6A9C89] ${
                        !isEditing ? "bg-gray-100" : "bg-white"
                      }`}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={isEditing ? formData.email : userData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6A9C89] ${
                        !isEditing ? "bg-gray-100" : "bg-white"
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 space-y-6">
                    <h4 className="text-lg font-medium text-gray-800">
                      Change Password
                    </h4>
                    <p className="text-sm text-gray-600">
                      Leave blank if you don't want to change your password
                    </p>

                    {/* Password Field */}
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6A9C89]"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="relative">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6A9C89]"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Account Information Section */}
            <div className="p-6 mt-6 bg-white rounded-lg shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                Account Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500">
                    Account Created
                  </p>
                  <p className="text-gray-700">
                    {userData.created_at
                      ? new Date(userData.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not available"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-gray-700">
                    {userData.updated_at
                      ? new Date(userData.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
