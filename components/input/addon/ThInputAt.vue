<script setup lang="ts">
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/vue'
import UserAvatar from '~/components/personal/UserAvatar.vue'
import { getPromptTemplate } from '~/composables/api/chat'

const props = defineProps<{
  input: string
  show: boolean
  target: any
}>()

const emits = defineEmits<{
  (event: 'select', data: any): void
}>()

const index = ref(-1)
// const query = ref('')
const roles = ref<any>([])

async function fetchData() {
  // 去除第一个字符
  const query = props.input.slice(1)

  const res: any = await getPromptTemplate(query)

  if (res.code === 200) {
    roles.value = res.data.items

    if (roles.value.length)
      index.value = 0
    else index.value = -1
  }
  else {
    ElMessage({
      message: res.message || '无法搜索模板！',
      grouping: true,
      type: 'error',
      plain: true,
    })
  }
}

function handleSelect(ind: number) {
  if (index.value === -1)
    return

  index.value = ind

  if (!roles.value[index.value])
    return

  emits('select', roles.value[index.value])
}

let timer: any
watch(() => props.input, () => {
  clearTimeout(timer)
  if (!props.show)
    return

  setTimeout(fetchData, 200)
})
watch(() => index.value, (ind) => {
  const id = `at-prompt-role-${ind}`
  const el = document.getElementById(id)

  if (el)
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
})

function handleKeyDown(e: KeyboardEvent) {
  if (!props.show)
    return

  if (!roles.value.length)
    return

  if (index.value === -1)
    return

  switch (e.key) {
    case 'ArrowUp':
      index.value = index.value > 0 ? index.value - 1 : roles.value.length - 1
      break
    case 'ArrowDown':
      index.value = index.value < roles.value.length - 1 ? index.value + 1 : 0
      break
    case 'Enter': {
      e.preventDefault()
      e.stopImmediatePropagation()
      handleSelect(index.value)
      break
    }
    default:
      break
  }

  // 判断小键盘上下键选择
}

onMounted(() => document.addEventListener('keydown', handleKeyDown))
onUnmounted(() => document.removeEventListener('keydown', handleKeyDown))

const inputRef = computed(() => props.target)
const floatingRef = ref()

const { floatingStyles } = useFloating(inputRef, floatingRef, {
  placement: 'left-start',
  middleware: [offset(({ rects }) => ({
    alignmentAxis: -rects.floating.height,
  })), flip()],
  whileElementsMounted: autoUpdate,
})
</script>

<template>
  <teleport to="#teleports">
    <div ref="floatingRef" :class="{ show }" class="ThInputAt-Wrapper" :style="floatingStyles">
      <div class="ThInputAt fake-background">
        <el-scrollbar>
          <el-empty v-if="!roles.length" description="暂无角色" />
          <div v-else class="ThInputAt-Main">
            <div
              v-for="(item, ind) in roles" :id="`at-prompt-role-${ind}`" :key="item.id" v-wave
              :class="{ active: index === ind }" class="ThInputAt-Item" @click="handleSelect(ind)"
            >
              <UserAvatar :avatar="item.avatar" />
              <div class="ThInputAt-Item-Info">
                <p>{{ item.title }}</p>
                <p class="description">
                  {{ item.description || '-' }}
                </p>
              </div>
              <span class="usage">{{ item.usages?.length }}人正在使用</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
.ThInputAt-Item {
  &.active {
    background-color: var(--el-fill-color);
  }

  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;
  padding-bottom: 1.5rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  transition: 0.3s;
  cursor: pointer;

  overflow-x: hidden;
  width: 100%;

  &:hover {
    background-color: var(--el-fill-color);
  }

  .el-avatar {
    width: 48px;
    height: 48px;
  }

  .usage {
    position: absolute;

    right: 0;
    bottom: 0.25rem;

    opacity: 0.75;
    transform: scale(0.75);
  }

  &-Info {
    flex: 1;
    width: 80%;
    margin-left: 1rem;

    p {
      &.description {
        // 高度只有一行 溢出隐藏
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        width: 70%;
      }

      margin: 0;

      &:first-child {
        font-size: 1.2rem;
        font-weight: bold;
      }

      &:last-child {
        font-size: 0.8rem;
        color: var(--el-text-color-secondary);
        line-height: 1.2rem;
      }
    }
  }
}

.ThInputAt-Main {
  position: relative;

  width: 100%;
}

.ThInputAt {
  .el-scrollbar__bar.is-vertical {
    width: 3px;
  }

  .show & {
    opacity: 1;
    transform: translateX(100%) scale(1) translateY(-1rem);
  }

  &-Wrapper {
    z-index: 2;
    pointer-events: none;

    width: 380px;
    height: 300px;

    &.show {
      pointer-events: all;
    }
  }

  position: absolute;
  padding: 1rem;

  width: 100%;
  height: 100%;

  border-radius: 16px;
  box-shadow: var(--el-box-shadow);

  opacity: 0;
  transform: translateX(100%) scale(0.9) translateY(10%);
  transition: cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.35s;
  transform-origin: center 10%;

  backdrop-filter: blur(18px) saturate(180%);
}
</style>
