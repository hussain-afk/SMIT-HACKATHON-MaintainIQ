import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: [],
};
const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    addAsset: (state, action) => {
      // Check if the asset already exists in the array using its unique Firebase ID
      const exists = state.assets.some(asset => asset.id === action.payload.id);
      
      // Only push if it's a completely new asset entry
      if (!exists) {
        state.assets.push(action.payload);
      }
    },
    removeAsset: (state, action) => {
      const assetIdToRemove = action.payload;
      state.assets = state.assets.filter(asset => asset.id !== assetIdToRemove);
    },
    updateAssetStatus: (state, action) => {
      const { id, status, assignedTo } = action.payload;
      const existingAsset = state.assets.find(asset => asset.id === id);
      if (existingAsset) {
        existingAsset.status = status;
        existingAsset.assignedTo = assignedTo;
      }
    }
  }
});
export const { addAsset, removeAsset, updateAssetStatus } = assetSlice.actions;
export default assetSlice.reducer;