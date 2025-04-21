import { API_BASE_URL, headers, handleResponse, handleError } from "./apiUtils";

// Get farm statistics
export const getFarmStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/farm-stats`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get livestock statistics
export const getLivestockStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/livestock-stats`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get crop statistics
export const getCropStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/crop-stats`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get revenue statistics
export const getRevenueStats = async (period = "monthly") => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/revenue-stats?period=${period}`,
      {
        method: "GET",
        headers,
      }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get dashboard summary data
export const getDashboardSummary = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/dashboard-summary`,
      {
        method: "GET",
        headers,
      }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};
