export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

export const ITEM_ENDPOINTS = {
  FEED: '/items',
  MY_ITEMS: '/items/my',
  CREATE: '/items',
  DETAIL: (id) => `/items/${id}`,
  SAVE: (id) => `/items/${id}/save`,
  UNSAVE: (id) => `/items/${id}/save`,
  SAVED: '/items/saved',
  UPDATE_STATUS: (id) => `/items/${id}/status`,
  DELETE: (id) => `/items/${id}`,
};

export const RENTAL_ENDPOINTS = {
  CREATE_REQUEST: '/messages/request',
  MY_REQUESTS: '/messages/requests/my-requests',
  INCOMING: '/messages/requests/incoming',
  DETAIL: (id) => `/messages/requests/${id}`,
  APPROVE: (id) => `/messages/requests/${id}/approve`,
  REJECT: (id) => `/messages/requests/${id}/reject`,
  CANCEL: (id) => `/messages/requests/${id}/cancel`,
  CONFIRM_LEND: (id) => `/messages/requests/${id}/confirm-lend`,
  ACCEPT_AGREEMENT: (id) => `/messages/requests/${id}/agreement`,
  MARK_RETURNED: (id) => `/messages/requests/${id}/returned`,
  RATE: (id) => `/messages/requests/${id}/rate`,
  CONVERSATIONS: '/messages/conversations',
  CONVERSATION: (id) => `/messages/conversations/${id}`,
  SEND_MESSAGE: (id) => `/messages/conversations/${id}`,
  MARK_READ: (id) => `/messages/conversations/${id}/read`,
};