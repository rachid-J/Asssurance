import { axiosClient } from "./axiosClient";

export const getVehicles = async () => {
  try {
    const response = await axiosClient.get('/vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}
export const getVehicle = async (id) => {
  try {
    const response = await axiosClient.get(`/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
}
export const createVehicle = async (vehicleData) => {
  try {
    const response = await axiosClient.post('/vehicles', vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
}
export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await axiosClient.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}
export const deleteVehicle = async (id) => {
  try {
    const response = await axiosClient.delete(`/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

export const getVehicleByPolicyId = async (policyId) => {
  try {
    const response = await axiosClient.get(`/vehicles/policy/${policyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles by policy ID:', error);
    throw error;
  }
}

// service/vehicleService.js
export const getVehiclesByClient = async (clientId) => {
    try {
      // Use the standard getVehicles endpoint with clientId filter
      const response = await axiosClient.get(`/vehicles?clientId=${clientId}`);
      return response.data.vehicles;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  };