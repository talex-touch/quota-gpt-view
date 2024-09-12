<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  totalPage: number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const page = useVModel(props, 'modelValue', emits)
</script>

<template>
  <div flex items-center>
    <div i-carbon:chevron-left cursor-pointer />
    <div>{{ page + 1 }} / {{ totalPage }}</div>
    <div i-carbon:chevron-right cursor-pointer />
  </div>
</template>

<style lang="scss">

</style>
