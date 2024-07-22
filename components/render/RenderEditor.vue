<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { EndNormalUrl } from '~/constants'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits(['update:modelValue'])

const value = useVModel(props, 'modelValue', emits)

const color = useColorMode()
const inner = ref()
onMounted(() => {
  const vditor = new Vditor(inner.value, {
    after() {
      vditor.setValue(value.value)

      watch(
        () => [color.value],
        () => {
          nextTick(() => {
            vditor.setTheme(color.value !== 'dark' ? 'classic' : 'dark')
          })
        },
        {
          immediate: true,
          deep: true,
        },
      )
    },
    input(content: string) {
      value.value = content
    },
    toolbarConfig: {
      pin: true,
    },
    preview: {
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
    },
    cache: {
      enable: true,
      id: 'guide-editor',
    },
    counter: {
      enable: true,
      type: 'text',
    },
    outline: {
      enable: true,
      position: 'right',
    },
    upload: {
      url: `${EndNormalUrl}api/tools/upload`,
      linkToImgCallback(responseText) {
        console.log('response text', responseText)
      },
      linkToImgFormat(responseText) {
        console.log('format response text', responseText)
      },
      format(files, responseText) {
        const result: any = {
          msg: '',
          code: 0,
          data: {
            errFiles: [],
            succMap: {
            },
          },
        }

        const res = JSON.parse(responseText)
        if (res.code !== 200)
          result.data.errFiles[0] = files[0].name

        else
          result.data.succMap[files[0].name] = `${EndNormalUrl}${res.data.filename}`

        return JSON.stringify(result)
      },
      headers: {
        Authorization: `Bearer ${userStore.value.token}`,
      },
      multiple: false,
      // withCredentials: true
    },
  })
})
</script>

<template>
  <div class="RenderEditor">
    <!-- <el-scrollbar>
      <div class="RenderEditor-Wrapper"> -->
    <div ref="inner" class="markdown-body RenderEditor-Inner" />
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

.RenderEditor {
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
    // margin: 0 0.25rem;
    // padding: 0.25rem 0.5rem;

    // border-radius: 12px;
    color: var(--el-text-color-primary);
    // background-color: var(--el-bg-color-page);
  }
}
</style>
