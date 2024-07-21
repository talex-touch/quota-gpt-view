<script setup lang="ts">
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { math } from '@milkdown/plugin-math'
import 'katex/dist/katex.min.css'
import 'prism-themes/themes/prism-nord.css'
import '@milkdown/theme-nord/style.css'
import { replaceAll } from '@milkdown/utils'
import { diagram } from '@milkdown/plugin-diagram'

import './style.css'
// import './style-light.css'
// import './style-dark.css'

import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx'

const props = defineProps<{
  data: string
  readonly: boolean
}>()

const inner = ref()
onMounted(async () => {
  const editor = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, inner.value)
      ctx.set(defaultValueCtx, props.data)
      ctx.update(editorViewOptionsCtx, prev => ({
        ...prev,
        editable: () => !props.readonly,
      }))
      ctx.set(prismConfig.key, {
        configureRefractor: (refractor) => {
          refractor.register(markdown)
          refractor.register(css)
          refractor.register(javascript)
          refractor.register(typescript)
          refractor.register(jsx)
          refractor.register(tsx)
        },
      })
    })
    .config(nord)
    .use(commonmark)
    .use(gfm)
    .use(math)
    .use(prism)
    .use(diagram)
    .create()

  watch(
    () => props.data,
    () => {
      editor.action(replaceAll(props.data))
    },
    {
      immediate: true,
      deep: true,
    },
  )
})
</script>

<template>
  <div class="RenderContent milkdown-render">
    <!-- <el-scrollbar>
      <div class="RenderContent-Wrapper"> -->
    <div ref="inner" class="markdown-body RenderContent-Inner" />
    <!-- </div>
    </el-scrollbar> -->
  </div>
</template>

<style lang="scss" scoped>
.RenderContent {
  position: relative;
  // &-Wrapper {
  //   padding-bottom: 1rem;
  // }

  // .el-scrollbar__bar.is-horizontal {
  //   height: 3px;
  //   left: 0;
  // }
  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  h3 {
    font-size: 1.125rem;
  }

  pre {
    margin: 0.5rem 0;
    padding: 0.5rem 0.25rem;

    max-width: 100%;

    overflow-x: scroll;
    border-radius: 12px;
    background-color: var(--el-bg-color-page);
  }

  code {
    margin: 0 0.25rem;
    padding: 0.25rem 0.5rem;

    border-radius: 12px;
    background-color: var(--el-bg-color-page);
  }
}
</style>
