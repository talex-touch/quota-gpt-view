<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps<{
  data: string
  readonly: boolean
  render: {
    enable: boolean
    media: boolean
  }
}>()
const color = useColorMode()
const inner = ref<HTMLDivElement>()
onMounted(() => {
  // const vditor = new Vditor(inner.value, {
  //   cache: {
  //     enable: false,
  //   },
  //   mode: 'wysiwyg',
  // })
  // const vditor = new Vditor(inner.value, {
  //   value: props.data,
  //   preview: {
  //     hljs: {
  //       enable: true,
  //       lineNumber: true,
  //       defaultLang: 'bash',
  //     },
  //     theme: {
  //       current: 'Ant Design',
  //     },
  //     math: {
  //       inlineDigit: true,
  //     },
  //     render: {
  //       media: {
  //         enable: true,
  //       },
  //     },
  //   },
  //   cache: {
  //     enable: false,
  //   },
  //   // mode: color.value !== 'dark' ? 'light' : 'dark',
  // })

  const regex = /\[([^[\]]+)\]/g

  watch(
    () => [props.data, color.value, props.render],
    () => {
      nextTick(() => {
        const data = props.data/* .replaceAll(regex, (content) => {
          let _content = content
          const regex1 = /`([^`]+)`/g
          if (regex1.test(content))
            _content = _content.replaceAll(regex1, '$1')

          _content = _content.replaceAll(regex, '$$$$$1$$$$').replaceAll('\$', '$')

          return _content
        }) */

        if (!(props.render.enable ?? true)) {
          inner.value!.textContent = data
          return ``
        }

        Vditor.preview(inner.value!, data, {
          hljs: {
            enable: true,
            lineNumber: true,
            defaultLang: 'bash',
          },
          theme: {
            current: 'Ant Design',
          },
          math: {
            inlineDigit: props.render.umlS ?? true,
          },
          render: {
            media: {
              enable: props.render.media ?? true,
            },
          },
          mode: color.value !== 'dark' ? 'light' : 'dark',
        })
      })

      // vditor.setValue(props.data, true)
    },
    {
      immediate: true,
      deep: true,
    },
  )
})
</script>

<template>
  <div class="RenderContent">
    <!-- <el-scrollbar>
      <div class="RenderContent-Wrapper"> -->
    <div ref="inner" class="markdown-body RenderContent-Inner" />
    <!-- </div>
    </el-scrollbar> -->
  </div>
</template>

<style lang="scss">
.vditor-reset {
  color: var(--el-text-color-primary);
}

// .language-echarts,
.language-abc svg {
  border-radius: 16px;
  background: #ffffff;
}

.language-echarts {
  // padding: 0.5rem 0;
  border-radius: 4px;

  // box-sizing: border-box;
}

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

  // pre {
  //   margin: 0.5rem 0;
  //   padding: 0.5rem 0.25rem;

  //   max-width: 100%;

  //   overflow-x: scroll;
  //   border-radius: 12px;
  //   background-color: var(--el-bg-color-page);
  // }
  // .language-abc {
  //   margin: 1rem 0;
  // }

  pre code {
    span.hljs-keyword {
      color: #cb5a3d;
      // color: var(--el-color-primary);
    }
    // margin: 0 0.25rem;
    // padding: 0.25rem 0.5rem;

    // border-radius: 12px;
    color: var(--el-text-color-primary);
    background-color: var(--el-bg-color-page);
  }
}
</style>
