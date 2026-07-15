import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: [],
};

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    // BUG FIX: before, this ONLY added brand-new assets. If the asset
    // already existed, calling addAsset with updated info (like a new
    // status) did NOTHING - the screen kept showing old data until a
    // full page refresh. Now: if it already exists, we UPDATE it in
    // place. If it's new, we add it. This is called an "upsert".
    addAsset: (state, action) => {
      const incomingAsset = action.payload;
      const existingIndex = state.assets.findIndex(
        (asset) => asset.id === incomingAsset.id
      );

      if (existingIndex === -1) {
        // Not found yet -> add it as a new asset.
        state.assets.push(incomingAsset);
      } else {
        // Already exists -> merge the new info on top of the old info.
        state.assets[existingIndex] = {
          ...state.assets[existingIndex],
          ...incomingAsset,
        };
      }
    },

    removeAsset: (state, action) => {
      const assetIdToRemove = action.payload;
      state.assets = state.assets.filter((asset) => asset.id !== assetIdToRemove);
    },

    updateAssetStatus: (state, action) => {
      const { id, status, assignedTo } = action.payload;
      const existingAsset = state.assets.find((asset) => asset.id === id);
      if (existingAsset) {
        existingAsset.status = status;
        existingAsset.assignedTo = assignedTo;
      }
    },
  },
});

export const { addAsset, removeAsset, updateAssetStatus } = assetSlice.actions;
export default assetSlice.reducer;
