// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
// import { authReducer } from '../features/auth/slice';
import { userReducer } from '../features/user/slice';
// import { ThunkAction, ThunkDispatch } from 'redux-thunk';
// import { AnyAction } from 'redux';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>; // dispatch 타입 (ThunkAction 포함)
