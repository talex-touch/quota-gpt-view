<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import clsx from 'clsx'

const langs = [
  'text',
  'typescript',
  'javascript',
  'html',
  'css',
  'json',
  'markdown',
]

const { contentRef, selected } = useNodeViewContext()
</script>

<template>
  <div class="EditorCodeBlock">
    <div role="presentation" :class="{ selected }">
      <el-button>Copy</el-button>

      <div class="EditorCodeBlock-Content">
        <pre :spellcheck="false">
          <code :ref="contentRef" />
        </pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.selected {
  outline: blue solid 1px;
}
</style>
