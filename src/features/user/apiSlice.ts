import { createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError } from 'axios';

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }) =>
  async ({ url, method, data, params }: { url: string; method: string; data?: any; params?: any }) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params });
      return { data: result.data };
    } catch (axiosError: unknown) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: 'https://api.example.com' }),
  endpoints: (builder) => ({
    fetchUser: builder.query<{
      avatarUrl: string | undefined; id: number; name: string; email: string 
}, number>({
      query: (userId) => ({ url: `/users/${userId}`, method: 'get' }),
    }),
  }),
});

export const { useFetchUserQuery } = apiSlice;