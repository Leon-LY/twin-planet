<template>
  <textarea
    v-if="multiline && lined"
    class="input-lined j-input"
    :value="modelValue"
    :placeholder="placeholder"
    @input="onInput"
    :maxlength="maxlength"
  />
  <textarea
    v-else-if="multiline"
    class="input-field j-input"
    :value="modelValue"
    :placeholder="placeholder"
    @input="onInput"
    :maxlength="maxlength"
  />
  <input
    v-else
    :class="lined ? 'input-lined' : 'input-field'"
    :value="modelValue"
    :placeholder="placeholder"
    :type="type"
    @input="onInput"
    class="j-input"
  />
</template>

<script setup lang="ts">
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

function onInput(e: any) {
  emit('update:modelValue', e.detail?.value ?? e.target?.value ?? '')
}
</script>

<style scoped>
.j-input {
  width: 100%;
  box-sizing: border-box;
}
</style>
