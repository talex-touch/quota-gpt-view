<script setup lang="ts">
import html2canvas from 'html2canvas'

const props = defineProps<{
  show: boolean
}>()

const imageHolder = ref()
const shareOptions = reactive({
  display: false,
  title: '',
  loading: false,
  messages: new Array<any>(),
})
const share: any = (inject('pageOptions')! as any).share

// watch(() => props.show, () => shareOptions.display = false)

const shareTools = [
  {
    icon: 'i-carbon-link',
    color: '#6175AA',
    label: '分享链接',
    trigger: () => {

    },
  },
  {
    icon: 'i-carbon-image-copy',
    color: '#B48E6F',
    label: '生成图片',
    trigger: () => {
      shareOptions.display = !shareOptions.display
    },
  },
  {
    icon: 'i-carbon-document',
    color: '#6B699D',
    label: '复制文本',
    trigger: () => {

    },
  },
]

watch(() => shareOptions.display, (val) => {
  if (!val)
    return

  const el = imageHolder.value
  if (!el)
    return

  [shareOptions.messages, shareOptions.title] = share.getMessages()
})

watch(() => share.enable, (val) => {
  if (!val)
    shareOptions.display = false
})

function getCanvas() {
  return html2canvas(imageHolder.value, {
    allowTaint: true,
    useCORS: true,
  })
}

async function downloadImage() {
  shareOptions.loading = true
  const url = (await getCanvas()).toDataURL('image/jpeg')
  shareOptions.loading = false

  const a = document.createElement('a')
  a.download = shareOptions.title
  a.href = url
  a.click()

  a.remove()

  shareOptions.display = false
  setTimeout(() => {
    share.enable = false
  }, 200)
}

async function duplicatingShearsClick() {
  shareOptions.loading = true
  const dataURL = (await getCanvas()).toDataURL()
  shareOptions.loading = false

  const data = await fetch(dataURL)
  const blob = await data.blob()
  const ClipboardItem = window.ClipboardItem
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ])

  ElMessage.success('复制成功')

  shareOptions.display = false
  setTimeout(() => {
    share.enable = false
  }, 200)
}
</script>

<template>
  <div :class="{ show }" class="ShareToolbox">
    <div
      v-for="(tool, ind) in shareTools" :key="tool.label" class="ShareToolbox-Item"
      :class="{ hide: ind !== 1 && shareOptions.display }" :style="`--c: ${tool.color};--i: ${ind * 0.25}s`"
      @click="tool.trigger"
    >
      <div v-wave class="ShareToolbox-Item-Icon">
        <div :class="tool.icon" />
      </div>
      <span>{{ tool.label }}</span>
    </div>
  </div>

  <div v-loading="shareOptions.loading" :class="{ display: props.show && shareOptions.display }" class="Share-Image">
    <el-scrollbar>
      <div ref="imageHolder" class="Share-Image-Inner">
        <div class="Share-Image-Head">
          <img alt="Logo" src="/public/logo.png">
          {{ shareOptions.title }}
          <p v-if="userStore.token" style="margin: 0">
            由 {{ userStore.nickname }}分享
          </p>
          <!-- <img alt="Logo" src="/public/logo.png"> -->
          <!-- <span v-if="shareOptions.title" v-text="shareOptions.title" />
          <span v-else>ThisAI!</span> -->
        </div>
        <div class="Share-Image-Main">
          <div v-for="(msg, ind) in shareOptions.messages" :key="ind" class="ShareMessage">
            <p class="title">
              {{ msg.role === 'assistant' ? 'ThisAI' : '我' }}
            </p>
            <RenderContent :render="{ enable: true, media: false }" readonly :data="msg.content" />
          </div>
        </div>
        <div class="Share-Image-Copyright">
          <img alt="Logo" src="/public/company.png">
          <span>Powered by QuotaWish</span>
        </div>
        <div class="Share-Image-Foot">
          <div class="Share-Image-Footer-Center">
            <img alt="Logo" src="/public/share-code.svg">
          </div>
          <div class="Share-Image-Footer-Text">
            <h1>扫描二维码 | 和 ThisAI 对话</h1>
            <p>一次性拥有所有AI</p>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <div class="Share-Image-Func">
      <el-button round @click="duplicatingShearsClick">
        复制图片
      </el-button>
      <el-button round @click="downloadImage">
        下载图片
      </el-button>
    </div>
  </div>
</template>

<style lang="scss">
.Share-Image {
  &-Copyright {
    margin: 1rem 0 4rem;
    display: flex;
    flex-direction: column;

    gap: 0.5rem;

    img {
      width: 24px;
      height: 24px;
    }

    span {
      opacity: 0.5;
    }

    font-size: 12px;
    align-items: center;
    justify-content: center;
  }

  &-Func {
    display: flex;

    height: 50px;

    align-items: center;
  }

  &-Foot {
    &er-Text {
      margin-top: 2.5rem;

      z-index: 1;
      display: flex;

      text-align: center;
      flex-direction: column;

      color: var(--el-text-color-primary);

      h1 {
        margin: 0;
        font-size: 16px;
      }

      p {
        margin: 0;

        color: 0.75;
        font-size: 14px;
      }
    }

    &er-Center {
      &::before {
        z-index: 0;
        content: '';
        position: absolute;

        top: 50%;
        left: 50%;

        width: 108px;
        height: 18px;

        border-radius: 18px;
        background: var(--el-text-color-placeholder);
        transform: translate(-50%, -50%) rotate(45deg);
      }

      &::after {
        z-index: 0;
        content: '';
        position: absolute;

        top: 50%;
        left: 50%;

        width: 108px;
        height: 18px;

        border-radius: 18px;
        background: var(--el-text-color-placeholder);
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      img {
        z-index: 1;
        position: absolute;

        left: 50%;

        width: 64px;
        height: 64px;

        transform: translate(-50%, -50%);
      }

      position: relative;
      display: flex;

      width: 100%;
    }

    margin: 5rem 0 2rem;
    padding: 2rem 0;
    display: flex;

    flex-direction: column;

    gap: 1rem;
    font-size: 16px;
    font-weight: 600;
    align-items: center;
    justify-content: center;

    color: var(--el-text-color-secondary);
  }

  &-Main {
    .ShareMessage {
      p.title {
        margin: 0.5rem 0;

        font-weight: 600;
        color: var(--el-text-color-placeholder);
      }

      padding: 1rem 0.5rem;

      border-bottom: 1px solid var(--el-border-color);

      &:last-child {
        border: none;
      }
    }

    .markdown-body p {
      min-height: 28px;
      height: auto;

      line-height: 1.5rem;
    }

    padding: 1rem;
    margin: 1rem;
    border: 1px solid var(--el-border-color);

    border-radius: 18px;
    background: var(--el-bg-color-page);
  }

  &-Head {
    img {
      margin-top: 0.25rem;

      width: 32px;
      height: 32px;
    }

    padding: 2rem 0;
    display: flex;
    flex-direction: column;

    gap: 1rem;
    font-size: 16px;
    font-weight: 600;
    align-items: center;
    justify-content: center;

    color: var(--el-text-color-secondary);
  }

  .el-scrollbar {
    width: 100%;
  }

  &-Inner {
    width: 100%;

    background: var(--el-bg-color);
  }

  &.display {
    height: 720px;
    opacity: 1;

    pointer-events: all;
    transform: translate(-50%, 0) scale(1);
  }

  z-index: 2;
  position: absolute;
  padding: 0.25rem;
  display: flex;

  gap: 0.5rem;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  left: 50%;
  bottom: 120px;

  width: 100%;
  height: 0;

  opacity: 0;
  overflow: hidden;
  border-radius: 16px;
  pointer-events: none;
  box-sizing: border-box;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  transform: translate(-50%, 20%) scale(0.8);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

@keyframes share_toolbox_item_join {
  from {
    opacity: 0;
    transform: translateY(10%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ShareToolbox {
  &.show {
    opacity: 1;

    div.ShareToolbox-Item-Icon {
      width: 42px;
      height: 42px;
    }

    .ShareToolbox-Item {
      &.hide {
        opacity: 0;
        animation: unset;
      }

      opacity: 0;
      animation: share_toolbox_item_join 0.5s var(--i) forwards;

      span {
        display: unset;
      }
    }
  }

  .ShareToolbox-Item {
    &:hover {
      filter: brightness(1.2);
    }

    .ShareToolbox-Item-Icon {
      display: flex;

      align-items: center;
      justify-content: center;

      width: 0;
      height: 0;

      color: #fff;
      font-size: 20px;
      font-weight: 600;
      background: var(--c);
      border-radius: 16px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    display: flex;
    flex-direction: column;

    gap: 0.25rem;
    cursor: pointer;

    span {
      font-size: 12px;
      font-weight: 500;
      line-height: 1.5;

      display: none;
    }

    opacity: 0;
    align-items: center;
    justify-content: center;
    transition: 0.125s;
  }

  padding: 0.25rem 0.5rem;
  display: flex;

  justify-content: space-between;

  width: 280px;

  opacity: 0;
  overflow: hidden;
  transition: 0.5s 0.25s;
}
</style>
