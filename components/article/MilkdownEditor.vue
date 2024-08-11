<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { codeBlockSchema, commonmark } from '@milkdown/preset-commonmark'

import { gfm } from '@milkdown/preset-gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener'

import { history } from '@milkdown/plugin-history'
import { clipboard } from '@milkdown/plugin-clipboard'
import { trailing } from '@milkdown/plugin-trailing'
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import { SlashProvider, slashFactory } from '@milkdown/plugin-slash'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { $view, getMarkdown, outline, replaceAll } from '@milkdown/utils'
import '@milkdown/theme-nord/style.css'

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
import { useNodeViewFactory } from '@prosemirror-adapter/vue'
import EditorCodeBlock from '~/components/article/components/EditorCodeBlock.vue'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', data: string): void
  (event: 'outline', data: any): void
  (event: 'onScroll', data: any): void
}>()

const model = useVModel(props, 'modelValue', emits)

function useSlashPluginView(view: any) {
  const contentDom = document.createElement('div')

  const slashProvider = new SlashProvider({
    content: contentDom,
  })

  return {
    update: (updatedView: any, prevState: any) => {
      slashProvider.update(updatedView, prevState)
    },
    destroy: () => {
      slashProvider.destroy()
      contentDom.remove()
    },
  }
}

function tooltipPluginView(view: any) {
  const content = document.createElement('div')

  const provider = new TooltipProvider({
    content,
  })

  return {
    update: (updatedView: any, prevState: any) => {
      provider.update(updatedView, prevState)
    },
    destroy: () => {
      provider.destroy()
      content.remove()
    },
  }
}

const nodeViewFactory = useNodeViewFactory()

const slash = slashFactory('my-slash')
const tooltip = tooltipFactory('my-tooltip')

const editor = useEditor((root) => {
  return Editor.make()
    .config(nord)
    .config((ctx) => {
      ctx.set(rootCtx, root)
      // ctx.set(defaultValueCtx, content.value)

      // ctx.update(editorViewOptionsCtx, prev => ({
      //   ...prev,
      // }))
      ctx.set(slash.key, {
        view: useSlashPluginView,
      })

      ctx.set(tooltip.key, {
        view: tooltipPluginView,
      })

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

      const listener = ctx.get(listenerCtx)

      let _updating = false
      watch(() => model.value, () => {
        if (_updating || !editor.get())
          return

        editor.get()?.action(replaceAll(model.value))
      })

      // watchEffect(() => {

      //   // get current markdown
      //   const markdown = editor.get()!.action(getMarkdown())

      //   console.log('editor', markdown, model.value, markdown === model.value, JSON.stringify(markdown), JSON.stringify(model.value))

      //   editor.get()?.action(replaceAll(model.value))
      // })

      let timer: any
      function _updateModelValue(markdown: string) {
        _updating = true
        model.value = markdown

        const _outline = editor.get()!.action(outline)(ctx)

        emits('outline', _outline)

        setTimeout(() => _updating = false, 100)
      }

      listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown === prevMarkdown)
          return

        clearTimeout(timer)
        timer = setTimeout(() => _updateModelValue(markdown), 100)
      })
    })
    .use(commonmark)
    .use(slash)
    .use(tooltip)
    .use(gfm)
    .use(clipboard)
    .use(commonmark)
    .use(history)
    .use(prism)
    .use(trailing)
    .use(listener)
    .use(
      $view(codeBlockSchema.node, () => nodeViewFactory({ component: EditorCodeBlock })),
    )
})
</script>

<template>
  <div class="GuideEditorContainer">
    <div class="GuideEditorContainer-Main">
      <el-scrollbar @scroll="emits('onScroll', $event)">
        <div class="GuideEditorContainer-MainWrapper">
          <Milkdown id="MilkEditor" class="MilkContent" />
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss">
.GuideEditorContainer {
  &-MainWrapper {
    position: relative;
    display: flex;
    padding: 1rem 1.25rem;

    left: 50%;

    width: 80%;
    max-width: 1280px;
    min-height: 100%;

    transform: translateX(-50%);
  }

  // .el-scrollbar__bar.is-vertical {
  //   width: 4px;
  // }

  .el-scrollbar__view,
  .el-scrollbar {
    position: relative;

    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  &-Main {
    padding: absolute;
    padding: 1rem 0.25rem;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    overflow: hidden;
    background-color: var(--el-bg-color-page);
  }
  padding: relative;

  width: 100%;
  height: 100%;
}

.MilkContent {
  .milkdown {
    height: 100%;
    width: 100%;

    // min-height: 100%;

    .editor {
      > p {
        margin: 1rem 0;
      }

      ul {
        li {
          &::before {
            content: '';
            position: absolute;

            top: 50%;
            left: 0%;

            width: 8px;
            height: 8px;

            border-radius: 50%;
            transform: translate(0, -50%);
            background-color: var(--theme-color);
          }

          position: relative;

          text-indent: 16px;
        }
      }

      min-height: 100%;

      &:focus-visible {
        outline: none;
      }
    }
  }
  position: relative;

  flex: 1;
  width: 100%;
  min-height: 100%;
}
</style>
