// Common API utilities

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://thesis-backend-tau.vercel.app/api/api";

// Default headers for JSON requests
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Get error message from the response body
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API error: ${response.status}`;
    throw new Error(errorMessage);
  }

  // For 204 No Content responses, return null instead of trying to parse JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Helper function to handle API errors
const handleError = (error) => {
  console.error("API Error:", error);
  throw error;
};

export { API_BASE_URL, headers, handleResponse, handleError };
