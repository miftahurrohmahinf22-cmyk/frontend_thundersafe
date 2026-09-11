import { createContext, useState, useEffect, useContext } from 'react';
import { apiClient } from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Muat session dari localStorage saat startup
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);

      // Simpan session di localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));

        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
      }

      return { success: true, user: receivedUser };
    } catch (error) {
      let message = 'Gagal masuk. Silakan coba lagi.';
      if (error.response) {
        // Backend merespons dengan HTTP Error Status (seperti 401, 403, 404, 500)
        message = error.response.data?.message || `Error ${error.response.status}: Autentikasi gagal.`;
      } else if (error.request || error.code === 'ERR_NETWORK') {
        // Network / CORS / Unreachable Server Error
        message = 'Gagal terhubung ke server backend. Cek koneksi internet Anda.';
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, message };
    }
  };

  const register = async (nama, email, password) => {
    try {
      await apiClient.post('/auth/register', { nama, email, password });
      // Otomatis login setelah pendaftaran berhasil
      const loginResult = await login(email, password);
      return loginResult;
    } catch (error) {
      console.error('Error saat register:', error);
      const message = error.response?.data?.message || 'Gagal mendaftar. Silakan cek data Anda.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (nama, photo_profile) => {
    try {
      const response = await apiClient.put('/users/profile', { nama, photo_profile });
      const { user: updatedUser } = response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error saat perbarui profil:', error);
      const message = error.response?.data?.message || 'Gagal memperbarui profil.';
      return { success: false, message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.put('/users/change-password', { oldPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error saat ubah kata sandi:', error);
      const message = error.response?.data?.message || 'Gagal mengubah kata sandi.';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!token,
        login,
        register,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
