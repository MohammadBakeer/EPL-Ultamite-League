import { createSlice } from '@reduxjs/toolkit';

const viewIdSlice = createSlice({
  name: 'viewId',
  initialState: {
    value: null,
  },
  reducers: {
    setViewId: (state, action) => {
      state.value = action.payload;
    },
    clearViewId: (state) => {
      state.value = null;
    },
  },
});

export const { setViewId, clearViewId } = viewIdSlice.actions;
export default viewIdSlice.reducer;
