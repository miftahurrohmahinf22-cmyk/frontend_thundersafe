import { apiClient } from './axios';

export const loginApi = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

export const registerApi = async (nama, email, password) => {
  const res = await apiClient.post('/auth/register', { nama, email, password });
  return res.data;
};
