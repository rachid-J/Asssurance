// client/src/services/clientService.js
import { axiosClient } from './axiosClient';

export const getClients = async (searchParams = {}) => {
  const response = await axiosClient.get('/clients', { params: searchParams });
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await axiosClient.post('/clients', clientData);
  return response.data;
};

export const updateClient = async (id, clientData) => {
  const response = await axiosClient.put(`/clients/${id}`, clientData);
  return response.data;
};

export const deleteClient = async (id) => {
  const response = await axiosClient.delete(`/clients/${id}`);
  return response.data;
};