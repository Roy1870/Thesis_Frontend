"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { CameraIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

const Profile = () => {
  // Remove phone_number and address from the userData state
  // Remove formData state completely since we're not using phone_number and address
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  // Remove the formData state and handleInputChange function since we don't need them anymore

  const getAuthToken = () => localStorage.getItem("authToken");

  // Remove the useEffect that fetches user data and replace it with direct localStorage access
  // Remove the loading state since we're not fetching data anymore
  // Update the userData state initialization to use localStorage values directly

  // Replace the useState and useEffect for userData and loading with:
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

  // Remove the loading state
  // Remove the fetchUserProfile function
  // Remove the loading check in the render function

  // Update the storeAndUpdateProfile function to only handle profile picture updates
  const storeAndUpdateProfile = async (newProfilePic) => {
    const formData = new FormData();
    const token = getAuthToken();

    formData.append("email", userData.email || "default@example.com");

    if (newProfilePic) {
      formData.append("profile_picture", newProfilePic);
    }

    try {
      const response = await axios.post(
        "https://thesis-backend-tau.vercel.app/api/api/user/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData({
        ...userData,
        profile_picture: response.data.profile.profile_picture,
      });

      return response.data;
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      setError("Failed to update profile picture");
      throw err;
    }
  };

  // Remove the formData state and handleInputChange function since we don't need them anymore

  // Update the handleSubmit function to remove phone_number and address
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(false);

    const formDataObj = new FormData();

    if (newProfilePicture) {
      formDataObj.append("profile_picture", newProfilePicture);
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        "https://thesis-backend-tau.vercel.app/api/api/user/profile",
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData({
        ...userData,
        profile_picture: response.data.profile.profile_picture,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
      setNewProfilePicture(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Update the cancelEdit function to remove formData reset
  const cancelEdit = () => {
    setIsEditing(false);
    setNewProfilePicture(null);
    setPreviewUrl(null);
  };

  // Remove the loading check in the render function
  // Replace:
  // With just the error check:
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
            <span>Failed to update profile. Please try again.</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Profile Picture Section */}
          <div className="md:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="relative w-32 h-32 mb-4 overflow-hidden rounded-full">
                    {previewUrl || userData.profile_picture ? (
                      <img
                        src={previewUrl || userData.profile_picture}
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

                    {isEditing && (
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 opacity-0 cursor-pointer group-hover:opacity-100"
                        onClick={triggerFileInput}
                      >
                        <CameraIcon className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    accept="image/*"
                  />
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
                    onClick={() => setIsEditing(true)}
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
                  {/* Name Field - Read Only */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={userData.name}
                      disabled
                      className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>

                  {/* Email Field - Read Only */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6">
                    <p className="mb-2 text-sm text-gray-600">
                      To update your profile picture, click on your avatar or
                      the button below.
                    </p>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                      Change Profile Picture
                    </button>
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
