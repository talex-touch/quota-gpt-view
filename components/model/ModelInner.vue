<script setup lang="ts">
import { models } from './model'
// import { inputProperty } from '~/components/input/input'

const props = defineProps<{
  modelValue: string
  expand: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelRef = ref()
const model = useVModel(props, 'modelValue', emits)

watch(
  () => props.expand,
  () => {
    handleLayout()
  },
  { immediate: true },
)

const expandSelect = ref()
async function handleLayout() {
  const el = modelRef.value
  if (!el) {
    nextTick(handleLayout)
    return
  }

  props.expand && (expandSelect.value = model.value)

  await sleep(100)

  const items = el.querySelectorAll('.ModelSelector-Item');
  [...items].forEach(async (item, index) => {
    if (props.expand) {
      Object.assign(item.style, {
        top: '0',
        left: `calc(${index * 200}px + ${0.5 * (index + 1)}rem)`,
        width: '200px',
      })

      item.style.top = '0px'
    }
    else {
      Object.assign(item.style, {
        top: `calc(${index * 36}px + ${1 * index}rem)`,
        left: '5%',
        width: '90%',
      })
    }
  })
}

function handleClick(item: any) {
  // if (props.expand) {
  //   expandSelect.value = item.value

  //   return
  // }

  if (item.valuable)
    return

  expandSelect.value = model.value = item.value
}

const mappedModel = computed(() => {
  const subscriptionType = userStore.value?.subscription?.type

  const _models = JSON.parse(JSON.stringify(models))
  if (!subscriptionType)
    return _models

  switch (subscriptionType) {
    case 'ULTIMATE':
      _models[2].valuable = false
      // fallthrough
    case 'STANDARD':
      _models[1].valuable = false
      break
  }

  return _models
})
</script>

<template>
  <div ref="modelRef" class="ModelSelector-Models">
    <div
      v-for="item in mappedModel"
      :key="item.name"
      v-wave
      :class="{
        active: model === item.value,
        valuable: item.valuable,
      }"
      class="ModelSelector-Item"
      @click="handleClick(item)"
    >
      <div v-if="item.valuable" i-carbon-locked />
      <div v-else i-carbon-unlocked />
      {{ item.name }}
    </div>
  </div>
</template>

<style lang="scss">
.ModelSelector-Models {
  .ModelSelector.expand & {
    top: 100px;

    left: 3.5%;
    width: 93%;

    height: calc(36px + 1rem);
  }
  position: absolute;

  left: 0;
  top: 0;

  width: 100%;
  height: 100px;

  border-radius: 16px;
  transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.ModelSelector-Item {
  .mobile & {
    font-size: 14px;
  }

  position: absolute;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  display: flex;

  align-items: center;

  gap: 0.5rem;
  height: 36px;

  cursor: pointer;
  border-radius: 12px;
  transition: 0.5s;

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
    // .ModelSelector.expand & {
    //   &:hover {
    //     color: var(--el-color-info);
    //   }

    //   color: var(--el-text-color-primary);
    // }
    color: var(--el-text-color-regular);
  }
}
</style>
