import { apiClient } from './axios';

export const getDashboardStats = async () => {
  // Ambil riwayat terakhir untuk statistik dashboard
  const res = await apiClient.get('/history', { params: { limit: 100, page: 1 } });
  return res.data;
};

export const getLatestPrediksi = async () => {
  const res = await apiClient.get('/history', { params: { limit: 5, page: 1, sort: 'newest' } });
  return res.data;
};

export const getCuacaTerbaru = async () => {
  try {
    const res = await apiClient.get('/cuaca/terbaru');
    return res.data;
  } catch {
    return null;
  }
};
