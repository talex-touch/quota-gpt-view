<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import EditorMindmap from './EditorMindmap.vue'
import EditorEcharts from './EditorEcharts.vue'

const { contentRef, selected, node } = useNodeViewContext()

const lang = computed(() => node.value.attrs.language)

const renderList = ['mindmap', 'echarts']

const renderMode = computed(() => !!renderList.find(item => item === lang.value))
</script>

<template>
  <div :lang="lang" class="EditorCodeBlock" :class="{ selected }">
    <template v-if="renderMode">
      <EditorMindmap v-if="lang === 'mindmap'" :node="node" />
      <EditorEcharts v-else-if="lang === 'echarts'" :node="node" />
    </template>
    <template v-else>
      <pre :spellCheck="false"><code :ref="contentRef" /></pre>
    </template>
  </div>
</template>

<style lang="scss">
.EditorCodeBlock {
  margin: 16px 0;
}
</style>
