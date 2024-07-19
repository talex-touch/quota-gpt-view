<script setup lang="ts">
import ThArrowCheckBox from '../checkbox/ThArrowCheckBox.vue'

const main = ref()
const expand = ref(true)

watch(() => expand.value, handleFlip, { immediate: true })

async function handleFlip() {
  const el = main.value
  if (!el) {
    nextTick(() => handleFlip())
    return
  }

  if (expand.value) {
    el.style.height = 'auto'
    const { height } = el.getBoundingClientRect()
    el.style.height = '0px'
    el.getBoundingClientRect()
    el.style.height = `${height}px`
    el.style.transition = 'height 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86)'
  }
  else {
    el.style.height = '0px'
  }
}
</script>

<template>
  <div :class="{ expand }" class="CmsMenu">
    <div v-wave flex items-center gap-2 class="CmsMenu-Header" @click="expand = !expand">
      <slot name="header">
        Header
      </slot>

      <div class="CmsMenu-Header-Icon">
        <ThArrowCheckBox v-model="expand" />
      </div>
    </div>

    <div ref="main" class="CmsMenu-Main">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.hamburger) {
  font-size: 10px;
}

.CmsMenu {
  &-Header {
    &-Icon {
      position: absolute;

      right: 1rem;

      width: 40px;
      height: 40px;
    }

    &:hover {
      background-color: var(--el-border-color-extra-light);
    }

    padding: 0.75rem 1.5rem;

    cursor: pointer;
    user-select: none;

    font-size: 14px;
    background-color: var(--el-bg-color);
  }

  &.expand {
    .CmsMenu-Header {
      color: var(--el-color-primary);
    }
  }

  position: relative;
  // margin: 0.25rem 0px;

  font-size: 14px;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}
</style>
