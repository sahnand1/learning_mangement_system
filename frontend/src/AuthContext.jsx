import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin({ username, password });
    localStorage.setItem('lms_token', res.data.token);
    localStorage.setItem('lms_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const registerUser = async (data) => {
    const res = await apiRegister(data);
    // If pending approval, don't log in
    if (res.data.pending) {
      return res.data;
    }
    localStorage.setItem('lms_token', res.data.token);
    localStorage.setItem('lms_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logoutUser = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register: registerUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
