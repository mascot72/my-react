// src/features/user/slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, initialUserState } from '../../entities/user';

interface UserState {
  data: User;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: initialUserState,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 사용자 정보를 설정하는 액션
    setUser(state, action: PayloadAction<User>) {
      state.data = action.payload;
    },
    // 사용자 로딩 상태 업데이트
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    // 오류를 설정하는 액션
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;
export const userReducer = userSlice.reducer;
