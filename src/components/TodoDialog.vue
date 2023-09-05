<script setup lang="ts">
import type { Todo } from '@/types/todo'
import { useField, useFieldArray, useForm } from 'vee-validate'
import { watch } from 'vue'
import { computed, reactive } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { watchEffect } from 'vue'

const props = defineProps<{
  open?: boolean
  mode?: 'create' | 'edit'
  todo?: Todo
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'update:mode', value: 'create' | 'edit'): void
  (
    event: 'save',
    value: {
      id?: string
      title: string
    }
  ): void
}>()

const dialogValue = computed({
  get() {
    return props.open
  },
  set(value) {
    emit('update:open', value)
  }
})

type TodoForm = {
  id: string
  title: string
}
const initialValues: TodoForm = {
  id: '',
  title: ''
}
const { resetForm, handleSubmit, defineInputBinds, errors } = useForm<TodoForm>({
  initialValues,
  validationSchema: toTypedSchema(
    z.object({
      id: z.string(),
      title: z.string().nonempty().nullable()
    })
  )
})

watch([() => props.todo, () => props.mode], ([todo, mode]) => {
  if (mode === 'edit' && todo?.title) {
    resetForm({
      values: {
        id: todo.id,
        title: todo.title
      }
    })
  }
})
const titleField = defineInputBinds('title')

const onSubmit = handleSubmit((value) => {
  resetForm({
    values: initialValues
  })
  emit('save', value)
  emit('update:open', false)
})
</script>
<template>
  <VDialog v-model="dialogValue" width="600">
    <template v-slot:activator="{ props }">
      <div class="new-todo-button-wrapper">
        <VBtn
          class="new-todo-button"
          variant="outlined"
          @click="emit('update:open', true), emit('update:mode', 'create')"
          v-bind="props"
          >New Todo</VBtn
        >
      </div>
    </template>

    <VCard>
      <form @submit="onSubmit">
        <VCardTitle>
          <span class="text-h6">Todo Dialog</span>
        </VCardTitle>

        <VCardText v-if="dialogValue">
          <VTextField
            variant="outlined"
            label="Title *"
            v-bind="titleField"
            :error-messages="errors['title']"
          ></VTextField>
        </VCardText>

        <VCardActions>
          <v-spacer></v-spacer>
          <VBtn
            variant="text"
            @click="
              emit('update:open', false),
                resetForm({
                  values: initialValues
                })
            "
          >
            Cancel
          </VBtn>
          <VBtn variant="text" type="submit"> Save </VBtn>
        </VCardActions>
      </form>
    </VCard>
  </VDialog>
</template>

<style scoped>
.new-todo-button-wrapper {
  padding: 16px;
  text-align: right;
}
</style>
