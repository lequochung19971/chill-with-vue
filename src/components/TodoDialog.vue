<script setup lang="ts">
import type { Todo } from '@/types/todo'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { watch } from 'vue'
import { computed, reactive } from 'vue'

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

const defaultValues = {
  title: ''
}
const formTodoState = reactive({ ...defaultValues })

const v = useVuelidate(
  {
    title: { required }
  },
  formTodoState
)

watch(
  () => [props.todo, props.mode],
  ([todo, mode]) => {
    if (todo && mode === 'edit') {
      Object.assign(formTodoState, todo)
    }
  }
)

const resetForm = () => {
  v.value.$reset()
  Object.assign(formTodoState, defaultValues)
}

const handleSave = async () => {
  const valid = await v.value.$validate()
  if (!valid) return

  emit('save', formTodoState)
  resetForm()
  emit('update:open', false)
}

const getErrorMessage = (name: keyof Todo) => {
  const message = v.value[name]?.$errors?.[0]?.$message
  return message ? message.toString() : ''
}
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
      <VCardTitle>
        <span class="text-h6">Todo Dialog</span>
      </VCardTitle>

      <VCardText v-if="dialogValue">
        <VTextField
          aria-required="true"
          variant="outlined"
          label="Title *"
          @blur="v.title.$touch"
          :error="v.title.$error"
          :error-messages="getErrorMessage('title')"
          v-model="formTodoState.title"
        ></VTextField>
      </VCardText>

      <VCardActions>
        <v-spacer></v-spacer>
        <VBtn variant="text" @click="emit('update:open', false), resetForm()"> Cancel </VBtn>
        <VBtn variant="text" @click="handleSave"> Save </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.new-todo-button-wrapper {
  padding: 16px;
  text-align: right;
}
</style>
