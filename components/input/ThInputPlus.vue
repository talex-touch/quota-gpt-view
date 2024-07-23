<script setup lang="ts">
import type { InputPlusProperty } from './input'

const props = defineProps<{
  modelValue: InputPlusProperty
}>()

const emits = defineEmits<{
  (name: 'update:modelValue', data: InputPlusProperty): void
}>()

const property = useVModel(props, 'modelValue', emits)

const options = [
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
    onclick: () => property.value.internet = !property.value.internet,
    checked: () => property.value.internet,
  },
]
</script>

<template>
  <div class="ThInput-Plus">
    <div class="ThInput-Plus-Option">
      <div v-for="option in options" :key="option.label" v-wave :class="{ checked: option.checked?.() }" class="ThInput-Plus-Option-Item" @click="option.onclick">
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
      </div>
    </div>
    <div class="button" i-carbon-add-large />
  </div>
</template>

<style lang="scss">
.ThInput-Plus-Option {
  &-Item {
    .checkbox-status {
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

  opacity: 0;
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
