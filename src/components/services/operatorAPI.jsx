import { API_BASE_URL, headers, handleResponse, handleError } from "./apiUtils";

// Get all operators
export const getAllOperators = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/operators`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get operator by ID
export const getOperatorById = async (operatorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/operators/${operatorId}`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Create new operator
export const createOperator = async (operatorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/operators`, {
      method: "POST",
      headers,
      body: JSON.stringify(operatorData),
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Update operator
export const updateOperator = async (operatorId, operatorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/operators/${operatorId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(operatorData),
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Delete operator
export const deleteOperator = async (operatorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/operators/${operatorId}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};
