<script setup lang="ts">
import type { InputPlusProperty } from './input'
import { chatManager } from '~/composables/chat'

const props = defineProps<{
  modelValue: InputPlusProperty
}>()

const emits = defineEmits<{
  (name: 'update:modelValue', data: InputPlusProperty): void
}>()

const property = useVModel(props, 'modelValue', emits)

const options: any = reactive([
  {
    icon: 'i-carbon-image',
    type: 'button',
    label: '分析图片',
  },
  {
    icon: 'i-carbon-document',
    type: 'button',
    label: '分析文件',
  },
  {
    icon: 'i-carbon-ibm-cloud-internet-services',
    type: 'checkbox',
    label: '联网能力',
    onclick: () => {
      if (chatManager.messages.value.model === 'this-normal')
        return

      property.value.internet = !property.value.internet
    },
    checked: () => property.value.internet,
  },
  {
    icon: 'i-carbon:temperature-celsius-alt',
    type: 'slider',
    label: '随机性',
    model: property.value.temperature,
  },
])

watch(() => chatManager.messages.value.model, (val) => {
  // 强制开启internet
  if (val === 'this-normal')
    property.value.internet = true
})
</script>

<template>
  <div class="ThInput-Plus">
    <div class="ThInput-Plus-Option">
      <div
        v-for="option in options" :key="option.label" v-wave :class="{ checked: option.checked?.() }"
        class="ThInput-Plus-Option-Item" @click="option.onclick"
      >
        <template v-if="option.type === 'button'">
          <div :class="option.icon" />
          <div>{{ option.label }}</div>
        </template>
        <template v-else-if="option.type === 'checkbox'">
          <div :class="option.icon" />
          <div>{{ option.label }}</div>

          <div class="checkbox-status">
            <div i-carbon-checkmark />
          </div>
        </template>
        <template v-else-if="option.type === 'slider'">
          <InputOptionSlider v-model="option.model" />
          <!-- <el-slider v-model="option.model" /> -->

          <div :class="option.icon" />
          <div class="slider-wrapper">
            <span>{{ option.label }}</span>

            <div style="opacity: .75;font-size: 14px" class="checkbox-status">
              {{ option.model }}%
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="button" i-carbon-add-large />
  </div>
</template>

<style lang="scss">
.ThInput-Plus-Option {
  &-Item {
    .slider-wrapper {
      .checkbox-status {
        top: 4px;
        right: 0.25rem;
      }

      > span {
        position: absolute;

        top: 0;
        left: 0;

        width: max-content;
      }

      position: relative;

      top: 0;

      width: 100%;
      height: calc(40px - 1rem);

      pointer-events: none;
    }

    // .el-slider {
    //   z-index: 1;
    //   position: absolute;

    //   top: 0;
    //   left: 0;

    //   height: 100%;

    //   opacity: 0.25;
    //   // --el-slider-height: 100%;
    //   // --el-slider-border-radius: 12px;

    //   // &__bar {
    //   //   border-radius: 12px;
    //   // }

    //   // &__button-wrapper {
    //   //   // visibility: hidden;
    //   // }
    // }

    .checkbox-status {
      z-index: 1;
      position: absolute;

      top: 0.75rem;
      right: 1rem;

      opacity: 0;
      transition: 0.25s;
    }

    &:hover {
      color: var(--el-color-primary);

      cursor: pointer;

      border-radius: 12px;
      background-color: var(--el-border-color-extra-light);
    }

    &.checked {
      color: var(--el-color-success);

      .checkbox-status {
        opacity: 1;
      }
    }

    position: relative;
    margin: 0.25rem 0;
    padding: 0.5rem 0.5rem;
    display: flex;

    gap: 0.5rem;
    align-items: center;

    user-select: none;
  }
  position: absolute;
  padding: 0.5rem 0.5rem;

  left: -0.5rem;
  bottom: 0;

  width: 180px;
  height: max-content;

  border-radius: 18px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);

  // opacity: 0;
  transition: 0.25s;
  transform-origin: left bottom;
  transform: translateY(-50px) translateY(10%) scale(0);
}

.ThInput-Plus {
  &:hover {
    .ThInput-Plus-Option {
      opacity: 1;
      transform: translateY(-50px) translateY(0%) scale(1);
    }

    cursor: pointer;
    background: var(--el-border-color-extra-light);
  }

  .button:active {
    transform: scale(0.75);
    transition: 0.25s;
  }
  z-index: 10;
  position: relative;
  display: flex;

  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  bottom: 2px;

  border-radius: 12px;
  transition: 0.25s;

  .generating & {
    opacity: 0;
  }
}
</style>
