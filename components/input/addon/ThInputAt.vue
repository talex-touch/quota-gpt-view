<script setup lang="ts">
import UserAvatar from '~/components/personal/UserAvatar.vue'
import { getPromptTemplate } from '~/composables/api/chat'

const props = defineProps<{
  input: string
  show: boolean
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
  else { ElMessage.error(res.message || '无法搜索模板！') }
}

function handleSelect(ind: number) {
  if (index.value === -1)
    return

  index.value = ind

  if (!roles.value[index.value])
    return

  emits('select', roles.value[index.value])
}

watch(() => props.input, fetchData)
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
</script>

<template>
  <div :class="{ show }" class="ThInputAt">
    <!-- <div class="ThInputAt-Header">
      <el-input v-model.lazy="query" placeholder="搜索角色模板..." />
    </div> -->
    <el-scrollbar>
      <el-empty v-if="!roles.length" description="暂无角色" />
      <div v-else class="ThInputAt-Wrapper">
        <div
          v-for="(item, ind) in roles" :id="`at-prompt-role-${ind}`" :key="item.id" v-wave
          :class="{ active: index === ind }" class="ThInputAt-Item" @click="handleSelect(ind)"
        >
          <UserAvatar :avatar="item.avatar" />
          <div class="ThInputAt-Item-Info">
            <p>{{ item.title }}</p>
            <p class="description">
              {{ item.content }}
            </p>
          </div>
          <span class="usage">{{ item.usages?.length }}人正在使用</span>
        </div>
      </div>
    </el-scrollbar>
  </div>
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

.ThInputAt-Wrapper {
  position: relative;
  padding-right: 0.5rem;

  width: 100%;
}

.ThInputAt {
  .el-scrollbar__bar.is-vertical {
    width: 3px;
  }

  &.show {
    transform: translateY(0) scale(1);
  }
  position: absolute;
  padding: 1rem;

  width: 380px;
  height: 300px;

  bottom: 60px;

  border-radius: 16px;
  transform-origin: left bottom;
  box-shadow: var(--el-box-shadow);
  transform: translateY(10%) scale(0);
  background-color: var(--el-bg-color);
  transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
