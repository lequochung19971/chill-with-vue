<script setup lang="ts">
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { reactive } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import TodoDialog from './components/TodoDialog.vue'
import type { Todo } from './types/todo'
import { Status } from './types/status'
import Button from './components/Button.vue'

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
const openDialog = ref(false)
const editedTodo = ref<Todo>()
const dialogMode = ref<'create' | 'edit'>('create')

const todos = ref<Todo[]>([
  {
    id: uuidv4(),
    title: 'Test',
    status: Status.DRAFT
  }
])

const saveTodo = async (savedValue: { title: string; id?: string }) => {
  if (dialogMode.value === 'create') {
    todos.value.push({
      id: uuidv4(),
      title: savedValue.title,
      status: Status.DRAFT
    })
  } else if (dialogMode.value === 'edit') {
    const index = todos.value.findIndex((t) => t.id === savedValue.id)
    if (index > -1) {
      todos.value[index] = {
        ...todos.value[index],
        ...savedValue
      }
    }
  }

  openDialog.value = false
}

const removeTodoItem = (index: number) => {
  todos.value.splice(index, 1)
}
const handleClickEditTodoItem = (todo: Todo) => {
  openDialog.value = true
  editedTodo.value = todo
  dialogMode.value = 'edit'
}
</script>

<template>
  <div class="container">
    <div class="wrapper">
      <VCard class="todo-card">
        <TodoDialog
          class="hung-dep-trai"
          v-model:open="openDialog"
          v-model:mode="dialogMode"
          @save="saveTodo"
          :todo="editedTodo"
        />
        <VDataTable items-per-page="5" :headers="headers" :items="todos" item-value="id">
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
              @click="removeTodoItem(item.index)"
            ></VBtn>
          </template>
        </VDataTable>
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
