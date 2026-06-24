<template>
  <textarea
    v-if="multiline && lined"
    class="input-lined j-input"
    v-model="innerValue"
    :placeholder="placeholder"
    :maxlength="maxlength > 0 ? maxlength : -1"
  />
  <textarea
    v-else-if="multiline"
    class="input-field j-input"
    v-model="innerValue"
    :placeholder="placeholder"
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

// 父 → 子同步
watch(() => props.modelValue, v => {
  if (innerValue.value !== v) innerValue.value = v || ''
})

// 子 → 父同步：watch innerValue 而非依赖 @input 事件（uni-app 编译会丢弃部分 @input）
watch(innerValue, v => {
  emit('update:modelValue', v)
})
</script>

<style scoped>
.j-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 88rpx;
}
</style>
