import {configureStore} from '@reduxjs/toolkit';
import assetReducer from './reducers/assetSlice';

const store = configureStore({
  reducer: {
    asset: assetReducer,
  },
});

export default store;