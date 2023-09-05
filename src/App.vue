<script setup lang="ts">
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { reactive } from 'vue'
import TodoDialog from './components/TodoDialog.vue'
import type { Todo } from './types/todo'
import { Status } from './types/status'
import Button from './components/Button.vue'
import { capitalize, difference } from 'lodash'
import { watch } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { storeToRefs } from 'pinia'
import { watchEffect } from 'vue'

const headers = [
  {
    title: 'Title',
    key: 'title'
  },
  {
    title: 'Status',
    key: 'status'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: 100
  }
]
enum SortColumn {
  TITLE = 'title',
  STATUS = 'status'
}
enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

const openDialog = ref(false)
const editedTodo = ref<Todo>()
const dialogMode = ref<'create' | 'edit'>('create')
const selected = ref<string[]>([])
const previousSelected = ref<string[]>([])
const loadingTable = ref(false)

const queryParams = reactive({
  _limit: 5,
  _page: 1,
  _sort: 'title',
  _order: 'asc'
})
const totalItems = ref(0)
const refreshQueryTodos = ref({})

const todoStore = useTodoStore()
const a = storeToRefs(todoStore)
console.log(a)

const saveTodo = async (savedValue: { title: string; id?: string }) => {
  if (dialogMode.value === 'create') {
    await todoStore.addTodo({
      id: uuidv4(),
      title: savedValue.title!,
      status: Status.DRAFT
    })
  } else if (dialogMode.value === 'edit') {
    await todoStore.updateTodo({
      ...savedValue,
      id: savedValue.id!
    })
  }

  refreshQueryTodos.value = {}

  openDialog.value = false
}

const removeTodoItem = async (id: string) => {
  await todoStore.removeTodoById(id)
  refreshQueryTodos.value = {}
}

const handleClickEditTodoItem = (todo: Todo) => {
  openDialog.value = true
  editedTodo.value = todoStore.getTodoById(todo.id)
  dialogMode.value = 'edit'
}

const handleUpdateOpen = (value: boolean) => {
  if (!value) {
    editedTodo.value = undefined
  }
}

const statusColor = (status: Status) => {
  switch (status) {
    case Status.COMPLETED:
      return 'green'

    default:
      return 'default'
  }
}

const handleUpdateSelected = async () => {
  const selectedItemIds = difference(selected.value, previousSelected.value)
  const unselectedItemIds = difference(previousSelected.value, selected.value)
  const updateTodoPms = selectedItemIds.map((itemId) => {
    return todoStore.updateTodo({
      id: itemId,
      status: Status.COMPLETED
    })
  })

  updateTodoPms.concat(
    unselectedItemIds.map((itemId) => {
      return todoStore.updateTodo({
        id: itemId,
        status: Status.DRAFT
      })
    })
  )
  if (updateTodoPms.length) {
    await Promise.all(updateTodoPms)
    refreshQueryTodos.value = {}
  }

  previousSelected.value = selected.value
}

const loadItems = (args: {
  itemsPerPage?: number
  page?: number
  search?: string
  sortBy?: { key: SortColumn; order: SortOrder }[]
}) => {
  const { itemsPerPage = 5, page = 1, search = '', sortBy } = args
  const sort = sortBy?.[0]
  Object.assign(queryParams, {
    _limit: itemsPerPage,
    _page: page,
    _sort: sort?.key ?? '',
    _order: sort?.order ?? ''
  })
}

watchEffect(async () => {
  if (refreshQueryTodos.value) {
    loadingTable.value = true
    const res = await todoStore.queryTodos(queryParams)
    totalItems.value = res.totalItems
    selected.value = todoStore.completedTodos.map((t) => t.id)
    loadingTable.value = false
  }
})
</script>

<template>
  <div class="container">
    <div class="wrapper">
      <VCard class="todo-card">
        <TodoDialog
          v-model:open="openDialog"
          v-model:mode="dialogMode"
          @update:open="handleUpdateOpen"
          @save="saveTodo"
          :todo="editedTodo"
        />
        <VDataTableServer
          v-model="selected"
          @update:model-value="handleUpdateSelected"
          :items-per-page="queryParams._limit"
          :items-length="totalItems"
          :headers="headers"
          :items="todoStore.todos"
          item-value="id"
          show-select
          select-strategy="page"
          :loading="loadingTable"
          @update:options="loadItems"
        >
          <template v-slot:item.title="{ item }">
            <span
              :class="item.raw.status === Status.COMPLETED ? 'text-decoration-line-through' : ''"
              >{{ item.raw.title }}</span
            >
          </template>
          <template v-slot:item.status="{ item }">
            <VChip :color="statusColor(item.raw.status)">{{ capitalize(item.raw.status) }}</VChip>
          </template>
          <template v-slot:item.actions="{ item }">
            <VBtn
              density="compact"
              icon="mdi-pencil"
              variant="flat"
              @click="handleClickEditTodoItem(item.raw)"
            ></VBtn>
            <VBtn
              density="compact"
              icon="mdi-delete"
              variant="flat"
              @click="removeTodoItem(item.raw.id)"
            ></VBtn>
          </template>
        </VDataTableServer>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: pink;
  height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.wrapper {
  position: relative;
  top: 100px;
  width: 800px;
}

.todo-card {
}
.todo-item {
  display: flex;
  align-items: center;
}
.todo-item__title {
  width: 100%;
  padding-right: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
}
.todo-form-card {
  display: flex;
  padding: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.todo-form-card__input {
  width: 100%;
}
</style>
./types/status
