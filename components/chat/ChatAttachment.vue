<script setup lang="ts">
import CalculatorResult from './attachments/CalculatorResult.vue'
import WeatherResult from './attachments/WeatherResult.vue'

const props = defineProps<{
  agent: {
    actions: any[]
    [propKey: string]: any
  }
}>()

const typeMapper: Record<string, Component> = {
  weather_result: WeatherResult,
  Calculator: CalculatorResult,
}

const agentActions = computed(() =>
  props.agent?.actions?.filter((item: any) => item.type === 'display' && item?.data?.type in typeMapper),
)

console.log('a', props)
</script>

<template>
  <div v-if="agentActions?.length" class="ChatAttachment">
    <component
      :is="typeMapper[item.data.type]"
      v-for="(item, index) in agentActions"
      :key="index"
      :data="item.data"
    />
  </div>
</template>

<style lang="scss">
.ChatAttachment {
  margin: 0.25rem 0;
}
</style>
