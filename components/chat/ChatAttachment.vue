<script setup lang="ts">
import CalculatorResult from './attachments/CalculatorResult.vue'
import WeatherResult from './attachments/WeatherResult.vue'
import QuotaSearchResult from './attachments/QuotaSearchResult.vue'
import QuotaSearchImagesResult from './attachments/QuotaSearchImagesResult.vue'
import QuotaSearchVideosResult from './attachments/QuotaSearchVideosResult.vue'
import type { IInnerItemMeta } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  block: IInnerItemMeta
}>()

const typeMapper: Record<string, {
  icon: string
  comp: Component
}> = {
  // weather_result: WeatherResult,
  // Calculator: CalculatorResult,
  // quota_search: QuotaSearchResult,
  // quota_search_images: QuotaSearchImagesResult,
  // quota_search_videos: QuotaSearchVideosResult,

  QuotaSearchAPI: {
    icon: 'i-carbon:search',
    comp: QuotaSearchResult,
  },
}

const curType = computed(() => typeMapper[props.block.name!])
</script>

<template>
  <div class="ChatAttachment fake-background">
    <template v-if="curType">
      <template v-if="!block.extra?.end">
        <i block :class="curType.icon" />
        <OtherTextShaving :text="block.data || '思考中'" />
      </template>
      <template v-else>
        <ChatQueryCollapse>
          <template #Header>
            <i block :class="curType.icon" />
            {{ block.data }}
          </template>
          <component :is="curType.comp" :value="block.value" :data="block.data" />
        </ChatQueryCollapse>
      </template>
    </template>
    <template v-else>
      <OtherTextShaving text="无法获取对应数据" />
      {{ block }}
    </template>
  </div>
</template>

<style lang="scss">
.ChatAttachment {
  position: relative;
  display: flex;

  align-items: center;

  margin: 0.25rem 0;
  padding: 0.25rem 0.75rem;

  gap: 0.25rem;
  width: max-content;
  max-width: 100%;

  overflow: hidden;
  border-radius: 12px;
  --fake-opacity: 0.75;
  // background-color: var(--el-bg-color-page);
}
</style>
