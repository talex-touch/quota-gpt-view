<script setup>
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { listenerCtx } from '@milkdown/plugin-listener'
import { nord } from '@milkdown/theme-nord'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { outline, replaceAll } from '@milkdown/utils'
import '@milkdown/theme-nord/style.css'
import '~/components/render/style.css'

import 'prism-themes/themes/prism-nord.css'

import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx'
import cpp from 'refractor/lang/cpp'
import c from 'refractor/lang/c'
import python from 'refractor/lang/python'
import java from 'refractor/lang/java'
import { useRichArticle } from '~/composables/rich-article.ts'

const props = defineProps(['content'])
const emits = defineEmits(['outline'])
onMounted(async () => {
  const editor = await Editor.make()
    .config((ctx) => {
      // ctx.set(defaultValueCtx, props.content)
      ctx.set(rootCtx, document.querySelector('#MilkEditor'))

      ctx.update(editorViewOptionsCtx, prev => ({
        ...prev,
        editable: () => false,
      }))

      ctx.set(prismConfig.key, {
        configureRefractor: (refractor) => {
          refractor.register(markdown)
          refractor.register(css)
          refractor.register(javascript)
          refractor.register(typescript)
          refractor.register(jsx)
          refractor.register(tsx)
          refractor.register(cpp)
          refractor.register(c)
          refractor.register(python)
          refractor.register(java)
        },
      })
    })
    .use(commonmark)
    .use(prism)
    .create()

  watchEffect(() => {
    editor.action(replaceAll(props.content))

    setTimeout(() => {
      useRichArticle(document.querySelector('#MilkEditor'))

      const _outline = editor.action(outline)(editor.ctx)

      emits('outline', _outline)
    }, 10)
  })
})
</script>

<template>
  <div id="MilkEditor" class="MilkContent markdown-body milkdown-theme-nord prose" />
</template>

<style lang="scss">
@import './style.scss';
</style>
