<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps<{
  data: string
  readonly: boolean
}>()
const color = useColorMode()
const inner = ref()
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

  watch(
    () => [props.data, color.value],
    () => {
      Vditor.preview(inner.value, props.data, {
        hljs: {
          enable: true,
          lineNumber: true,
          defaultLang: 'bash',
        },
        theme: {
          current: 'Ant Design',
        },
        math: {
          inlineDigit: true,
        },
        render: {
          media: {
            enable: true,
          },
        },
        mode: color.value !== 'dark' ? 'light' : 'dark',
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
