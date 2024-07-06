import { configureStore } from '@reduxjs/toolkit';
import viewReducer from './viewSlice';

const store = configureStore({
  reducer: {
    viewId: viewReducer,
  },
});

export default store;
