import { Status } from '@/types/status'
import type { Todo } from '@/types/todo'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { todosApi, type PostTodoRequest, type PutTodoRequest } from '@/http-client/todosApi'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([
    {
      id: uuidv4(),
      title: 'Test',
      status: Status.DRAFT
    }
  ])
  const test = ref('test')

  const completedTodos = computed(() => {
    const isCompleted = (todo: Todo) => todo.status === Status.COMPLETED
    return todos.value.filter(isCompleted)
  })

  const addTodo = async (newTodo: PostTodoRequest) => {
    try {
      await todosApi.postTodo(newTodo)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const queryTodos = async (params: object) => {
    try {
      const response = await todosApi.getTodos(params)
      const totalItems: number | undefined = +response.headers['x-total-count']
      todos.value = response.data
      return {
        data: response.data,
        totalItems
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const removeTodoById = async (id: string) => {
    try {
      await todosApi.deleteTodo(id)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const updateTodo = async (editedTodo: PutTodoRequest) => {
    try {
      await todosApi.patchTodo(editedTodo)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const setTodos = (value: Todo[]) => {
    todos.value = value
  }

  const getTodoById = (id: string) => {
    return todos.value.find((todo) => todo.id === id)
  }

  return {
    todos,
    test,
    addTodo,
    removeTodoById,
    updateTodo,
    setTodos,
    getTodoById,
    completedTodos,
    queryTodos
  }
})
