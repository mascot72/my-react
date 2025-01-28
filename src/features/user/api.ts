// src/features/user/api.ts
import axios from 'axios';
// import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUser, setLoading, setError } from './slice';
import { AppDispatch } from '../../app/store'; // AppDispatch를 import

// 사용자 정보를 가져오는 함수
export const fetchUser = (userId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));  // 로딩 상태 시작

    // 실제 API 호출
    const response = await axios.get(`https://api.example.com/users/${userId}`);
    const data = response.data;
    dispatch(setUser(data));  // 사용자 정보 설정
  } catch (error) {
    dispatch(setError('Failed to fetch user data'));  // 오류 처리
    console.log(error)
  } finally {
    dispatch(setLoading(false));  // 로딩 상태 종료
  }
};
