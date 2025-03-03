import { createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError } from 'axios';
interface axiosParam {
  url: string;
  method: string;
  data?: unknown;
  params?: unknown;
}
const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }) =>
  async ({ url, method, data, params }: axiosParam) => {
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

interface FetchUserResponse {
  avatarUrl: string | undefined;
  id: number;
  name: string;
  email: string;
}

interface SetUserRequest {
  userId: string;
  value: string;
}

interface SetUserResponse {
  result: boolean;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: 'https://api.example.com' }),
  endpoints: (builder) => ({
    fetchUser: builder.query<FetchUserResponse, number>({
      query: (userId) => ({ url: `/users/${userId}`, method: 'get' }),
    }),
    setUser: builder.mutation<SetUserResponse, SetUserRequest>({
      query: ({userId, value}: SetUserRequest) => ({ url: `/users/${userId}`, method: 'post', body: { value } }),
    }),
  }),
});

export const { useFetchUserQuery, useSetUserMutation } = apiSlice;