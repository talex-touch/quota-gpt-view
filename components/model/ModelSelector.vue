<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = useVModel(props, 'modelValue', emits)

const models = reactive([
  {
    name: 'QuotaGPT 标准模型',
    value: 'gpt-3.5-turbo',
  },
  {
    name: 'QuotaGPT 强化模型',
    value: 'gpt-3o-turbo',
    valuable: true,
  },
  {
    name: 'QuotaGPT 高级模型',
    value: 'gpt-4-turbo',
    valuable: true,
  },
])

const curSelect = computed(() => models.find(item => item.value === model.value))
</script>

<template>
  <div class="ModelSelector">
    <span class="model-name">
      {{ curSelect!.name }}
      <div i-carbon-chevron-up />
    </span>

    <div class="ModelSelector-Selections">
      <div
        v-for="item in models"
        :key="item.name"
        v-wave
        :class="{ active: model === item.value, valuable: item.valuable }"
        class="ModelSelector-Item"
        @click="!item.valuable ? (model = item.value) : void 0"
      >
        <div v-if="item.valuable" i-carbon-locked />
        <div v-else i-carbon-unlocked />
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ModelSelector {
  &:hover {
    .model-name div {
      transform: rotate(180deg);
    }

    cursor: pointer;
  }

  .model-name {
    div {
      transition: 0.25s;
    }
    display: flex;

    gap: 0.5rem;
    align-items: center;
  }

  &-Item {
    padding: 0.5rem 1rem;
    display: flex;

    align-items: center;

    gap: 0.5rem;
    height: 36px;

    cursor: pointer;
    border-radius: 12px;

    &:hover {
      background-color: var(--el-bg-color-page);
    }
    &.active {
      background-color: var(--el-color-primary);
    }
    &.valuable {
      &:hover {
        color: var(--el-color-danger);
      }
      color: var(--el-color-info);
    }
  }

  &:hover {
    .ModelSelector-Selections {
      transform: scale(1);
    }
  }

  &-Selections {
    z-index: 1;
    position: absolute;
    padding: 0.5rem;
    display: flex;
    margin: 1rem 0;

    gap: 1rem;
    flex-direction: column;

    top: 100%;
    right: 0;

    width: max-content;

    border-radius: 16px;
    transform: scale(0);
    transform-origin: right top;
    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color);
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }
  position: relative;

  user-select: none;
}
</style>
