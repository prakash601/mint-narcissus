import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createLogger } from '@/lib/logger';
import {
  getFeedApi,
  getMyItemsApi,
  createItemApi,
  getItemByIdApi,
  saveItemApi,
  unsaveItemApi,
  getSavedItemsApi,
  updateItemStatusApi,
  deleteItemApi,
} from '../api/items.api';

const log = createLogger('items');

const initialState = {
  items: [],
  myItems: [],
  currentItem: null,
  savedItems: [],
  status: 'idle',
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export const fetchFeed = createAsyncThunk('items/fetchFeed', async (params, { rejectWithValue }) => {
  try {
    return await getFeedApi(params);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch feed');
  }
});

export const fetchMyItems = createAsyncThunk('items/fetchMyItems', async (_, { rejectWithValue }) => {
  try {
    return await getMyItemsApi();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch my items');
  }
});

export const createItem = createAsyncThunk('items/createItem', async (formData, { rejectWithValue }) => {
  try {
    return await createItemApi(formData);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create item');
  }
});

export const fetchItemById = createAsyncThunk('items/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await getItemByIdApi(id);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch item');
  }
});

export const toggleSaveItem = createAsyncThunk(
  'items/toggleSave',
  async ({ id, isSaved }, { rejectWithValue }) => {
    try {
      if (isSaved) {
        await unsaveItemApi(id);
        return { id, saved: false };
      } else {
        const result = await saveItemApi(id);
        return { item: result.data, saved: true };
      }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save item');
    }
  },
);

export const fetchSavedItems = createAsyncThunk('items/fetchSaved', async (_, { rejectWithValue }) => {
  try {
    return await getSavedItemsApi();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch saved items');
  }
});

export const updateItemStatus = createAsyncThunk(
  'items/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await updateItemStatusApi(id, status);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update item status');
    }
  },
);

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await deleteItemApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete item');
    }
  },
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFeed: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = {
          page: action.payload.page || state.pagination.page,
          limit: state.pagination.limit,
          total: action.payload.total ?? state.pagination.total,
          totalPages: action.payload.totalPages ?? Math.ceil((action.payload.total ?? 0) / state.pagination.limit) || 0,
        };
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch feed', { meta: { message: action.payload } });
      })
      .addCase(fetchMyItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myItems = action.payload.data;
      })
      .addCase(fetchMyItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch my items', { meta: { message: action.payload } });
      })
      .addCase(createItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myItems.unshift(action.payload.data);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to create item', { meta: { message: action.payload } });
      })
      .addCase(fetchItemById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentItem = action.payload.data;
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch item', { meta: { message: action.payload } });
      })
      .addCase(toggleSaveItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(toggleSaveItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.saved) {
          state.savedItems.unshift(action.payload.item);
        } else {
          state.savedItems = state.savedItems.filter((item) => item.id !== action.payload.id);
        }
      })
      .addCase(toggleSaveItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to save item', { meta: { message: action.payload } });
      })
      .addCase(fetchSavedItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSavedItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.savedItems = action.payload.data;
      })
      .addCase(fetchSavedItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to fetch saved items', { meta: { message: action.payload } });
      })
      .addCase(updateItemStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateItemStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedItem = action.payload.data;
        state.myItems = state.myItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        );
        state.items = state.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        );
        if (state.currentItem?.id === updatedItem.id) {
          state.currentItem = updatedItem;
        }
      })
      .addCase(updateItemStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to update item status', { meta: { message: action.payload } });
      })
      .addCase(deleteItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload;
        state.myItems = state.myItems.filter((item) => item.id !== deletedId);
        state.items = state.items.filter((item) => item.id !== deletedId);
        state.savedItems = state.savedItems.filter((item) => item.id !== deletedId);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Failed to delete item', { meta: { message: action.payload } });
      });
  },
});

export const { clearCurrentItem, clearError, clearFeed } = itemsSlice.actions;
export default itemsSlice.reducer;