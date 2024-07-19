import { createSlice } from '@reduxjs/toolkit';

const leagueSlice = createSlice({
  name: 'leagueId',
  initialState: {
    leagueId: null,
  },
  reducers: {
    setLeagueId: (state, action) => {
      state.leagueId = action.payload;
    },
    clearLeagueId: (state) => {
      state.leagueId = null;
    },
  },
});

export const { setLeagueId, clearLeagueId } = leagueSlice.actions;
export default leagueSlice.reducer; // Corrected here
