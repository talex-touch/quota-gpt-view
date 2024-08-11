<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import { ProsemirrorAdapterProvider, useNodeViewFactory } from '@prosemirror-adapter/vue'
import Milkdown from '~/components/article/MilkdownEditor.vue'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', data: string): void
  (event: 'outline', data: any): void
}>()

const model = useVModel(props, 'modelValue', emits)
</script>

<template>
  <ProsemirrorAdapterProvider>
    <MilkdownProvider>
      <Milkdown v-model="model" />
    </MilkdownProvider>
  </ProsemirrorAdapterProvider>
</template>
