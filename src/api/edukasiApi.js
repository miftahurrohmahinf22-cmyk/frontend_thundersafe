import { apiClient } from './axios';

export const getEdukasi = async () => {
  const res = await apiClient.get('/edukasi');
  return res.data;
};
