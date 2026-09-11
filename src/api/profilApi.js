import { apiClient } from './axios';

export const getProfil = async () => {
  const res = await apiClient.get('/users/profile');
  return res.data;
};

export const updateProfil = async (data) => {
  const res = await apiClient.put('/users/profile', data);
  return res.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const res = await apiClient.put('/users/change-password', { oldPassword, newPassword });
  return res.data;
};
