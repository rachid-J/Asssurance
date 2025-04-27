// service/vehicleDocumentService.js
import { axiosClient } from './axiosClient';

export const getVehicleDocuments = async (vehicleId) => {
  try {
    const response = await axiosClient.get(`/vehicles/${vehicleId}/documents`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch documents' };
  }
};

export const addVehicleDocument = async (vehicleId, formData) => {
  try {
    const response = await axiosClient.post(
      `/vehicles/${vehicleId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

export const getVehicleDocumentUrl = (vehicleId, documentId) => {
  return `${import.meta.env.VITE_API_URL}/vehicles/${vehicleId}/documents/${documentId}`;
};

export const deleteVehicleDocument = async (vehicleId, documentId) => {
  try {
    const response = await axiosClient.delete(
      `/vehicles/${vehicleId}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete document' };
  }
};

export const getVehicleDocument = async (vehicleId, documentId) => {
  try {
    const response = await axiosClient.get(
      `/vehicles/${vehicleId}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch document' };
  }
};