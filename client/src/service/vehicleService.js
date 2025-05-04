import { axiosClient } from "./axiosClient";

export const getVehicles = async (params = {}) => {
  try {
    const response = await axiosClient.get('/vehicles', { params });
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

export const getVehicleByInsurancesId = async (InsurancesId) => {
  try {
    const response = await axiosClient.get(`/vehicles/Insurances/${InsurancesId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles by Insurances ID:', error);
    throw error;
  }
}

// service/vehicleService.js
export const getVehiclesByClient = async (clientId) => {
    try {
      // Use the standard getVehicles endpoint with clientId filter
      const response = await axiosClient.get(`/vehicles?clientId=${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  };