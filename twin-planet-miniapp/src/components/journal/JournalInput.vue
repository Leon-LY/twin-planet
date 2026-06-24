<template>
  <textarea
    v-if="multiline && lined"
    class="input-lined j-input"
    v-model="innerValue"
    :placeholder="placeholder"
    @input="onInput"
    :maxlength="maxlength > 0 ? maxlength : -1"
  />
  <textarea
    v-else-if="multiline"
    class="input-field j-input"
    v-model="innerValue"
    :placeholder="placeholder"
    @input="onInput"
    :maxlength="maxlength > 0 ? maxlength : -1"
  />
  <input
    v-else
    :class="lined ? 'input-lined' : 'input-field'"
    v-model="innerValue"
    :placeholder="placeholder"
    :type="type"
    :maxlength="maxlength > 0 ? maxlength : -1"
    class="j-input"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  lined?: boolean
  multiline?: boolean
  type?: string
  maxlength?: number
}>(), {
  modelValue: '',
  placeholder: '',
  lined: false,
  multiline: false,
  type: 'text',
  maxlength: -1,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const innerValue = ref(props.modelValue)

watch(() => props.modelValue, v => {
  if (innerValue.value !== v) innerValue.value = v || ''
})

function onInput(e: any) {
  // uni-app 的 @input 事件：e.detail.value 是输入文本
  const val = (e && e.detail && typeof e.detail.value === 'string') ? e.detail.value : innerValue.value
  emit('update:modelValue', val)
}
</script>

<style scoped>
.j-input {
  width: 100%;
  box-sizing: border-box;
}
</style>
