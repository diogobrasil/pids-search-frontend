import { api } from './api';
import Cookies from 'js-cookie';

export const AuthService = {
  async registerUser(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async loginUser(data: any) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  setToken(token: string) {
    Cookies.set('token', token, { expires: 7 }); // expira em 7 dias
  },

  getToken() {
    return Cookies.get('token');
  },

  removeToken() {
    Cookies.remove('token');
  },
  
  isAuthenticated() {
    return !!this.getToken();
  }
};
