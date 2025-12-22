import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
    setWishlist: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addToWishlist: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlistError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setWishlistLoading,
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistError
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
