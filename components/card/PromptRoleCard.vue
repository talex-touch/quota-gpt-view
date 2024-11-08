<script name="PromptRoleCard" setup lang="ts">
import type { IPromptRole } from '~/composables/api/base/v1/aigc/index.type'

const props = defineProps<{
  modelValue: IPromptRole
}>()

const src = computed(() => formatEndsImage(props.modelValue.avatar))

const keywordsTags = computed(() => [...(props.modelValue.keywords || '').split(',')].filter(i => i).slice(0, 3))
</script>

<template>
  <div class="PromptRoleCard transition-cubic">
    <div class="PromptroleCard-Header">
      <div class="PromptRoleCard-Header-Main">
        <p class="title">
          {{ modelValue.title }}
        </p>
        <p class="subtitle">
          0 人正在使用
        </p>
      </div>
      <img :src="src" :alt="modelValue.title">
    </div>

    <div class="PromptRoleCard-Main">
      <p>{{ modelValue.description }}</p>
    </div>

    <div flex items-center justify-between gap-2 class="PromptRoleCard-Footer">
      <div>
        <span flex cursor-pointer items-center gap-1 class="func">
          <i i-carbon:favorite block />
          {{ modelValue.description.length * 12 }}
        </span>
      </div>

      <div class="PromptRoleCard-Keywords">
        <span v-for="(i, ind) in keywordsTags" :key="ind">{{ i }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.PromptRoleCard-Footer {
  .PromptRoleCard-Keywords {
    display: flex;

    gap: 0.25rem;

    span {
      padding: 0.25rem 0.5rem;

      font-size: 12px;
      border-radius: 10px;
      background-color: var(--el-fill-color);
    }
  }
  position: relative;
  margin-top: 1rem;

  color: var(--el-text-color-regular);
}

.PromptRoleCard-Main {
  max-height: 2.5em;

  overflow: hidden;
  p {
    font-size: 14px;
    line-height: 20px;
    color: var(--el-text-color-secondary);

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
}

.PromptroleCard-Header {
  .title {
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
  }
  .subtitle {
    opacity: 0.75;
    font-size: 14px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }
  display: flex;

  width: 100%;

  align-items: center;
  justify-content: space-between;
}

.PromptRoleCard {
  img {
    width: 16px;
    height: 16px;

    border-radius: 50%;
  }
  position: relative;
  padding: 0.75rem;

  // width: 200px;
  // height: 100px;

  cursor: pointer;
  // box-shadow: var(--el-box-shadow);

  border-radius: 18px;
  background-color: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color);

  &:hover {
    transform: scale(1.05);

    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--theme-color);
  }
}
</style>
