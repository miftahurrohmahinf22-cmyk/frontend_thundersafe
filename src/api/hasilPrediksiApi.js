import { apiClient } from './axios';

export const getHistory = async (params = {}) => {
  const res = await apiClient.get('/history', { params });
  return res.data;
};

export const deleteHistory = async (id) => {
  const res = await apiClient.delete(`/history/${id}`);
  return res.data;
};
