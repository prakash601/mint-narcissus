import axiosInstance from './axios';
import { RENTAL_ENDPOINTS } from './endpoints';

export const createRequestApi = async (outfitId) => {
  const response = await axiosInstance.post(RENTAL_ENDPOINTS.CREATE_REQUEST, { outfitId });
  return response.data;
};

export const getMyRequestsApi = async (params) => {
  const response = await axiosInstance.get(RENTAL_ENDPOINTS.MY_REQUESTS, { params });
  return response.data;
};

export const getIncomingRequestsApi = async (params) => {
  const response = await axiosInstance.get(RENTAL_ENDPOINTS.INCOMING, { params });
  return response.data;
};

export const getRequestByIdApi = async (id) => {
  const response = await axiosInstance.get(RENTAL_ENDPOINTS.DETAIL(id));
  return response.data;
};

export const approveRequestApi = async (id) => {
  const response = await axiosInstance.patch(RENTAL_ENDPOINTS.APPROVE(id));
  return response.data;
};

export const rejectRequestApi = async (id) => {
  const response = await axiosInstance.patch(RENTAL_ENDPOINTS.REJECT(id));
  return response.data;
};

export const cancelRequestApi = async (id) => {
  const response = await axiosInstance.patch(RENTAL_ENDPOINTS.CANCEL(id));
  return response.data;
};

export const confirmLendApi = async (id) => {
  const response = await axiosInstance.patch(RENTAL_ENDPOINTS.CONFIRM_LEND(id));
  return response.data;
};

export const acceptAgreementApi = async (id) => {
  const response = await axiosInstance.post(RENTAL_ENDPOINTS.ACCEPT_AGREEMENT(id));
  return response.data;
};

export const markReturnedApi = async (id) => {
  const response = await axiosInstance.patch(RENTAL_ENDPOINTS.MARK_RETURNED(id));
  return response.data;
};

export const submitRatingApi = async (id, rating) => {
  const response = await axiosInstance.post(RENTAL_ENDPOINTS.RATE(id), { rating });
  return response.data;
};

export const getConversationsApi = async () => {
  const response = await axiosInstance.get(RENTAL_ENDPOINTS.CONVERSATIONS);
  return response.data;
};

export const getConversationHistoryApi = async (id, params) => {
  const response = await axiosInstance.get(RENTAL_ENDPOINTS.CONVERSATION(id), { params });
  return response.data;
};

export const sendMessageApi = async (id, text) => {
  const response = await axiosInstance.post(RENTAL_ENDPOINTS.SEND_MESSAGE(id), { text });
  return response.data;
};

export const markConversationReadApi = async (id) => {
  const response = await axiosInstance.patch(RENTAL_ENDPOINTS.MARK_READ(id));
  return response.data;
};