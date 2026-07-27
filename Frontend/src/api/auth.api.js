import axiosInstance from './axios';
import { AUTH_ENDPOINTS } from './endpoints';

export const registerApi = async (payload) => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, payload);
  return data;
};

export const loginApi = async (credentials) => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
  return data;
};

export const logoutApi = async () => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
  return data;
};

export const getMeApi = async () => {
  const { data } = await axiosInstance.get(AUTH_ENDPOINTS.ME);
  return data;
};

export const updateMeApi = async (payload) => {
  const { data } = await axiosInstance.patch(AUTH_ENDPOINTS.ME, payload);
  return data;
};

export const linkedinOAuthRedirect = () => {
  window.location.replace(`${import.meta.env.VITE_API_BASE_URL}/auth/linkedin`);
};

export const authHealthApi = async () => {
  const { data } = await axiosInstance.get(AUTH_ENDPOINTS.AUTH_HEALTH);
  return data;
};