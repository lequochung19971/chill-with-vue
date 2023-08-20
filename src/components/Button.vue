<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'
import { useAttrs } from 'vue'
import { pick, omit } from 'lodash'
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

function omitAndPick<T extends object, U extends keyof T>(object: T, keys: Array<U>): Pick<T, U> {
  if (!keys.length) return {} as Pick<T, U>

  return keys.reduce((result, key) => {
    result[key] = object[key]
    delete object[key]
    return result
  }, {} as Pick<T, U>)
}
defineOptions({
  inheritAttrs: false
})

const a = ['a', 'b']
type b = keyof typeof a
type c = Record<b, string>
interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {}
const props = defineProps<Props>()
// omitAndPick(props, ['onClick'])
// omit(props.buttonProps, ['onClick'])
console.log(props)
</script>

<template>
  <button v-bind="props" @click="console.log('click inside 1')">TEST 1</button>
</template>

<style scoped></style>
