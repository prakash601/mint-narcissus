import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createLogger } from '@/lib/logger';
import {
  createRequestApi,
  getMyRequestsApi,
  getIncomingRequestsApi,
  getRequestByIdApi,
  approveRequestApi,
  rejectRequestApi,
  cancelRequestApi,
  confirmLendApi,
  acceptAgreementApi,
  markReturnedApi,
  submitRatingApi,
  getConversationsApi,
  getConversationHistoryApi,
  sendMessageApi,
  markConversationReadApi,
} from '../api/rental.api';

const log = createLogger('rental');

const initialState = {
  incomingRequests: [],
  myRequests: [],
  currentRequest: null,
  conversations: [],
  currentConversation: null,
  status: 'idle',
  error: null,
  pagination: {},
};

export const fetchIncomingRequests = createAsyncThunk(
  'rental/fetchIncoming',
  async (params, { rejectWithValue }) => {
    try {
      return await getIncomingRequestsApi(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch incoming requests');
    }
  },
);

export const fetchMyRequests = createAsyncThunk(
  'rental/fetchMyRequests',
  async (params, { rejectWithValue }) => {
    try {
      return await getMyRequestsApi(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch my requests');
    }
  },
);

export const createBorrowRequest = createAsyncThunk(
  'rental/createRequest',
  async (outfitId, { rejectWithValue }) => {
    try {
      return await createRequestApi(outfitId);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create request');
    }
  },
);

export const fetchRequestById = createAsyncThunk(
  'rental/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await getRequestByIdApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch request');
    }
  },
);

export const approveRequest = createAsyncThunk(
  'rental/approve',
  async (id, { rejectWithValue }) => {
    try {
      return await approveRequestApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to approve request');
    }
  },
);

export const rejectRequest = createAsyncThunk(
  'rental/reject',
  async (id, { rejectWithValue }) => {
    try {
      return await rejectRequestApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject request');
    }
  },
);

export const cancelRequest = createAsyncThunk(
  'rental/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await cancelRequestApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel request');
    }
  },
);

export const confirmLend = createAsyncThunk(
  'rental/confirmLend',
  async (id, { rejectWithValue }) => {
    try {
      return await confirmLendApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to confirm lend');
    }
  },
);

export const acceptAgreement = createAsyncThunk(
  'rental/acceptAgreement',
  async (id, { rejectWithValue }) => {
    try {
      return await acceptAgreementApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to accept agreement');
    }
  },
);

export const markReturned = createAsyncThunk(
  'rental/markReturned',
  async (id, { rejectWithValue }) => {
    try {
      return await markReturnedApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark returned');
    }
  },
);

export const submitRating = createAsyncThunk(
  'rental/rate',
  async ({ id, rating }, { rejectWithValue }) => {
    try {
      return await submitRatingApi(id, rating);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to submit rating');
    }
  },
);

export const fetchConversations = createAsyncThunk(
  'rental/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await getConversationsApi();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch conversations');
    }
  },
);

export const fetchConversationHistory = createAsyncThunk(
  'rental/fetchConversation',
  async (id, { rejectWithValue }) => {
    try {
      return await getConversationHistoryApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch conversation');
    }
  },
);

export const sendMessage = createAsyncThunk(
  'rental/sendMessage',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      return await sendMessageApi(id, text);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send message');
    }
  },
);

export const markConversationRead = createAsyncThunk(
  'rental/markRead',
  async (id, { rejectWithValue }) => {
    try {
      return await markConversationReadApi(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark as read');
    }
  },
);

const rentalSlice = createSlice({
  name: 'rental',
  initialState,
  reducers: {
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      if (state.currentConversation?.messages) {
        state.currentConversation.messages.push(action.payload);
      }
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomingRequests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.incomingRequests = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchIncomingRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch incoming requests', { meta: { message: action.payload } });
      })
      .addCase(fetchMyRequests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myRequests = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch my requests', { meta: { message: action.payload } });
      })
      .addCase(createBorrowRequest.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBorrowRequest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myRequests.unshift(action.payload.data);
      })
      .addCase(createBorrowRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to create borrow request', { meta: { message: action.payload } });
      })
      .addCase(fetchRequestById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentRequest = action.payload.data;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch request', { meta: { message: action.payload } });
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.incomingRequests = state.incomingRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        state.myRequests = state.myRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.incomingRequests = state.incomingRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        state.myRequests = state.myRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.myRequests = state.myRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        state.incomingRequests = state.incomingRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(confirmLend.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.incomingRequests = state.incomingRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        state.myRequests = state.myRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(acceptAgreement.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.myRequests = state.myRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(markReturned.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.incomingRequests = state.incomingRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.incomingRequests = state.incomingRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        state.myRequests = state.myRequests.map((r) =>
          r.id === updated.id ? updated : r,
        );
        if (state.currentRequest?.id === updated.id) {
          state.currentRequest = updated;
        }
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.data;
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.currentConversation = action.payload.data;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentConversation?.messages) {
          state.currentConversation.messages.push(action.payload.data);
        }
      })
      .addCase(markConversationRead.fulfilled, (state) => {
        if (state.currentConversation) {
          state.currentConversation.unreadCount = 0;
        }
      });
  },
});

export const {
  clearCurrentRequest,
  clearError,
  addMessage,
  setCurrentConversation,
} = rentalSlice.actions;
export default rentalSlice.reducer;