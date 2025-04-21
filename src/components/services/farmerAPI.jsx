import { API_BASE_URL, headers, handleResponse, handleError } from "./apiUtils";

// Get all crops
export const getAllCrops = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get crop by ID
export const getCropById = async (cropId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Create new crop
export const createCrop = async (cropData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops`, {
      method: "POST",
      headers,
      body: JSON.stringify(cropData),
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Update crop
export const updateCrop = async (cropId, cropData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(cropData),
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Delete crop
export const deleteCrop = async (cropId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get crops by farmer ID
export const getCropsByFarmerId = async (farmerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}/crops`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};
