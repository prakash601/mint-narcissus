import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import itemsReducer from './itemsSlice';
import rentalReducer from './rentalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
    rental: rentalReducer,
  },
});

export default store;