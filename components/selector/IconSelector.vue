<script setup lang="ts">
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import FontCarbon from '~/constants/carbon.json'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = useVModel(props, 'modelValue', emit)

const icons = [
  {
    label: 'Carbon',
    type: 'carbon',
    value: FontCarbon,
  },
]

const searchQuery = ref('')
const activeTab = ref('carbon')

const loadedIndex = ref(100)

function loadMoreIcon() {
  loadedIndex.value += 100
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting)
      loadMoreIcon()
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  })

  observer.observe(document.getElementById('load-more')!)

  onBeforeUnmount(() => {
    observer.disconnect()
  })
})

watch(() => activeTab.value, () => loadedIndex.value = 100)

const filteredIcons = computed(() => {
  const icon = (icons.find(item => item.type === activeTab.value)!.value)
    .filter((_, index) => index <= loadedIndex.value)

  if (searchQuery.value)
    return icon.filter(item => item.includes(searchQuery.value))

  return icon
})
</script>

<template>
  <div class="IconSelector">
    <el-popover placement="bottom-start" :width="255" trigger="click">
      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane v-for="icon in icons" :key="icon.type" :label="icon.label" :name="icon.type">
          <div class="IconSelector-Container">
            <el-input v-model="searchQuery" :placeholder="`从&quot;${icon.label}&quot;中搜索图标`" />

            <el-scrollbar>
              <div class="IconSelector-List">
                <div
                  v-for="item in filteredIcons" :key="item" :active="{ 'bg-primary-light-9': model === item }"
                  :alt="item" class="IconSelector-Item" @click="model = item"
                >
                  <div :class="item" />
                </div>

                <div id="load-more" op-0 class="load-more">
                  Lore more
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #reference>
        <el-input v-model="model">
          <template #prefix>
            <div h-4 w-4 :class="model" />
          </template>
        </el-input>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss">
.IconSelector {
  &-Container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &-List {
    padding-right: 8px;

    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    height: 300px;
    justify-content: flex-start;
  }

  &-Item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    > div {
      font-size: 18px;
    }
  }
}
</style>
