import { apiClient } from './axios';

export const getPetaRisiko = async (simulate = false) => {
  const res = await apiClient.get('/lokasi', { params: { simulate } });
  return res.data;
};
