<script setup lang="ts">
import QueryCollapse from '../QueryCollapse.vue'

const props = defineProps<{
  data: any
}>()
</script>

<template>
  <div class="QuotaSearchResult">
    <ChatQueryCollapse>
      <template #Header>
        <div i-carbon-link />
        参考
        <span class="text-primary">({{
          data.results.length
        }})</span>
      </template>
      <span
        v-for="(item, index) in data.results"
        :key="item.href"
        :style="`--i: ${(index + 1) * 0.125}s`"
        class="ChatItem-ReferenceList"
      >
        <a target="_blank" :href="item.href">{{
          item.title
        }}</a>
      </span>
    </ChatQueryCollapse>
  </div>
</template>

<style lang="scss">
.QuotaSearchResult {
  &:hover {
    opacity: 0.5;
  }
  position: relative;
  padding: 0.25rem 0.5rem;

  width: max-content;
  height: max-content;

  opacity: 0.25;
  font-size: 14px;
  // border-radius: 12px;
  // border: 1px solid var(--el-border-color);
}
</style>
