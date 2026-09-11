import { apiClient } from './axios';

export const submitPrediksi = async (data) => {
  const res = await apiClient.post('/prediction', data);
  return res.data;
};

export const getLokasi = async () => {
  const res = await apiClient.get('/lokasi');
  return res.data;
};
