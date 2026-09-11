import { apiClient } from './axios';

export const getNotifikasi = async () => {
  const res = await apiClient.get('/notifications');
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await apiClient.put(`/notifications/read/${id}`);
  return res.data;
};
