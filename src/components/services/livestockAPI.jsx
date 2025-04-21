import { API_BASE_URL, headers, handleResponse, handleError } from "./apiUtils";

// Get all livestock
export const getAllLivestock = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/livestock`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get livestock by ID
export const getLivestockById = async (livestockId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/livestock/${livestockId}`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Create new livestock
export const createLivestock = async (livestockData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/livestock`, {
      method: "POST",
      headers,
      body: JSON.stringify(livestockData),
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Update livestock
export const updateLivestock = async (livestockId, livestockData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/livestock/${livestockId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(livestockData),
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Delete livestock
export const deleteLivestock = async (livestockId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/livestock/${livestockId}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get livestock by farmer ID
export const getLivestockByFarmerId = async (farmerId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/farmers/${farmerId}/livestock`,
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
