import type { Todo } from '@/types/todo'
import httpClient from '.'
import type { AxiosResponse } from 'axios'

export type PostTodoRequest = Todo
function postTodo<TResponseData = Todo, R = AxiosResponse<TResponseData>, D = PostTodoRequest>(
  todo: D
) {
  return httpClient.post<TResponseData, R, D>('/todos', todo)
}

export type PutTodoRequest = {
  id: string
} & Partial<Pick<Todo, 'title' | 'status'>>

function patchTodo<
  TResponseData = Todo,
  R = AxiosResponse<TResponseData>,
  D extends PutTodoRequest = PutTodoRequest
>(todo: D) {
  return httpClient.patch<TResponseData, R, D>(`/todos/${todo.id}`, todo)
}

function getTodos<TResponseData = Todo[]>(params: object) {
  return httpClient.get<TResponseData>('/todos', {
    params
  })
}

function getTodo<TResponseData = Todo>(id: string) {
  return httpClient.get<TResponseData>(`/todos/${id}`)
}

function deleteTodo<TResponseData = Todo>(id: string) {
  return httpClient.delete<TResponseData>(`/todos/${id}`)
}

export const todosApi = {
  postTodo,
  patchTodo,
  getTodos,
  getTodo,
  deleteTodo
}
