import { createApi } from '@reduxjs/toolkit/query/react'
import axios, { AxiosError } from 'axios'
interface axiosParam {
  url: string
  method: string
  data?: unknown
  params?: unknown
}
const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }) =>
  async ({ url, method, data, params }: axiosParam) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params })
      return { data: result.data }
    } catch (axiosError: unknown) {
      const err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

interface FetchUserResponse {
  avatarUrl: string | undefined
  id: number
  name: string
  email: string
}

interface SetUserRequest {
  userId: string
  value: string
}

interface SetUserResponse {
  result: boolean
}

interface Todo {
  id?: number
  text?: string
  completed?: boolean
  mission?: string
  company?: string
  location?: string
  date?: string
  time?: string
  rocket?: string
  price?: number
  successful?: boolean
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:5000/api' }),
  endpoints: (builder) => ({
    fetchUser: builder.query<FetchUserResponse, number>({
      // query: (userId) => ({ url: `/users/${userId}`, method: 'get' }),
      query: (userId) => ({ url: `/example-assets/space-mission-data.json`, method: 'get' }),
    }),
    setUser: builder.mutation<SetUserResponse, SetUserRequest>({
      query: ({ userId, value }: SetUserRequest) => ({ url: `/users/${userId}`, method: 'post', body: { value } }),
    }),
    fetchTodos: builder.query<Todo[], void>({
      query: () => ({ url: '/todos', method: 'get' }),
    }),
    addTodo: builder.mutation<Todo, Partial<Todo>>({
      query: (newTodo) => ({ url: '/todos', method: 'post', data: newTodo }),
    }),
    updateTodo: builder.mutation<Todo, Todo>({
      query: (updatedTodo) => ({ url: `/todos/${updatedTodo.id}`, method: 'put', data: updatedTodo }),
    }),
    deleteTodo: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({ url: `/todos/${id}`, method: 'delete' }),
    }),
  }),
})

export const {
  useFetchUserQuery,
  useSetUserMutation,
  useFetchTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = apiSlice
