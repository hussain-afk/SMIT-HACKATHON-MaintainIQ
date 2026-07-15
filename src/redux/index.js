import { configureStore } from '@reduxjs/toolkit';
import assetReducer from './reducers/assetSlice';

// Redux is a big shared box that holds our data (the list of assets)
// so any page/component can read it or change it.
const store = configureStore({
  reducer: {
    asset: assetReducer,
  },
});

export default store;
