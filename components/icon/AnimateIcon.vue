<script lang="ts" setup>
const props = defineProps<{
  active?: boolean
  tip?: string
}>()

const emits = defineEmits(['click'])

const button = ref()
watch(() => props.active, (visible) => {
  if (!visible)
    return

  const container = button.value

  container.querySelectorAll('animate').forEach((element: any) => {
    element.beginElement()
  })
})

function handleClick() {
  const container = button.value

  container.querySelectorAll('animate').forEach((element: any) => {
    element.beginElement()
  })

  emits('click')
}
</script>

<template>
  <button ref="button" :class="{ active }" class="AnimateIcon" @click="handleClick">
    <slot />
    <div v-if="tip" class="transition-cubic AnimateIcon-Tooltip">
      {{ tip }}
    </div>
  </button>
</template>

<style lang="scss">
.AnimateIcon-Tooltip {
  .AnimateIcon:hover & {
    opacity: 1;
    filter: blur(0);
    transform: translate(1rem, -50%) scale(1);
  }
  position: absolute;
  padding: 0.25rem 0.5rem;

  top: 50%;
  left: 100%;

  width: max-content;
  opacity: 0;
  filter: blur(5px);
  border-radius: 12px;
  transform: translate(1rem, -50%) scale(0);
  transform-origin: left;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
}

.AnimateIcon {
  &.active {
    color: var(--theme-color);
  }

  svg {
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    // mask-image: var(--icon);
    // mask-repeat: no-repeat;
    // mask-size: 100% 100%;
  }
  position: relative;

  width: 32px;
  height: 32px;

  color: var(--el-text-color-placeholder);
}
</style>
