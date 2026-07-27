import axiosInstance from './axios';
import { ITEM_ENDPOINTS } from './endpoints';

export const getFeedApi = async (params) => {
  const response = await axiosInstance.get(ITEM_ENDPOINTS.FEED, { params });
  return response.data;
};

export const getMyItemsApi = async () => {
  const response = await axiosInstance.get(ITEM_ENDPOINTS.MY_ITEMS);
  return response.data;
};

export const createItemApi = async (formData) => {
  const response = await axiosInstance.post(ITEM_ENDPOINTS.CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getItemByIdApi = async (id) => {
  const response = await axiosInstance.get(ITEM_ENDPOINTS.DETAIL(id));
  return response.data;
};

export const saveItemApi = async (id) => {
  const response = await axiosInstance.post(ITEM_ENDPOINTS.SAVE(id));
  return response.data;
};

export const unsaveItemApi = async (id) => {
  const response = await axiosInstance.delete(ITEM_ENDPOINTS.UNSAVE(id));
  return response.data;
};

export const getSavedItemsApi = async () => {
  const response = await axiosInstance.get(ITEM_ENDPOINTS.SAVED);
  return response.data;
};

export const updateItemStatusApi = async (id, status) => {
  const response = await axiosInstance.patch(ITEM_ENDPOINTS.UPDATE_STATUS(id), { status });
  return response.data;
};

export const deleteItemApi = async (id) => {
  const response = await axiosInstance.delete(ITEM_ENDPOINTS.DELETE(id));
  return response.data;
};