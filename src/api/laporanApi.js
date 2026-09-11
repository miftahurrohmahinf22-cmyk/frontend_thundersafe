import { apiClient } from './axios';

export const getLaporanData = async () => {
  // Ambil seluruh data observasi cuaca CSV untuk laporan PDF / CSV
  const res = await apiClient.get('/history', { params: { limit: 20000, page: 1 } });
  return res.data;
};

export const saveLaporan = async (data) => {
  try {
    const res = await apiClient.post('/laporan', data);
    return res.data;
  } catch {
    return { success: false };
  }
};
