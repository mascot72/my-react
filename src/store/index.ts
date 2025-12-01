// DEPRECATED: This store is replaced by src/app/store.ts
// Please import from '@/app/store' instead.
// This file is kept temporarily for reference and will be removed in the next major version.

import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../features/user/apiSlice'

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
