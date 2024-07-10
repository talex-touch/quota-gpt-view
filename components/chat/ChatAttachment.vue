<script setup lang="ts">
import WeatherResult from './attachments/WeatherResult.vue'

const props = defineProps<{
  agent: {
    actions: any[]
    [propKey: string]: any
  }
}>()

const typeMapper: Record<string, Component> = {
  weather_result: WeatherResult,
}

const agentActions = computed(() =>
  props.agent.actions?.filter((item: any) => item?.type in typeMapper),
)
</script>

<template>
  <div v-if="agentActions?.length" class="ChatAttachment">
    <component
      :is="typeMapper[item.type]"
      v-for="(item, index) in agentActions"
      :key="index"
      :data="item"
    />
  </div>
</template>
