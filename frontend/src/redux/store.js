import { configureStore } from '@reduxjs/toolkit';
import viewIdReducer from './viewSlice';
import leagueIdReducer from './leagueSlice'; // Corrected the import name

const store = configureStore({
  reducer: {
    viewId: viewIdReducer,
    leagueId: leagueIdReducer, // This is correct
  },
});

export default store;
