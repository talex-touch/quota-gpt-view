<script setup lang="ts">
const props = defineProps<{
  show: boolean
  length: number
}>()

const share: any = (inject('pageOptions')! as any).share

const check = ref(false)
function toggleAllSelect() {
  share.selected = !check.value ? [...Array(props.length).keys()] : []
}

watch(() => share.selected, (val) => {
  check.value = val.length === props.length
}, { deep: true, immediate: true })
</script>

<template>
  <div :class="{ show }" class="ShareSection">
    <div class="Share-Select" flex cursor-pointer select-none items-center gap-2 @click="toggleAllSelect">
      <el-checkbox v-model="check" :indeterminate="share.selected.length > 0 && share.selected.length < props.length" :checked="share.selected.length === props.length" @change="toggleAllSelect" />全选
    </div>
    <div class="Share-Funcs">
      生成图片
    </div>
    <div class="Share-Mention">
      已选择 {{ share.selected.length }} 条消息
    </div>
  </div>
</template>

<style lang="scss">
.ShareSection {
  &.show {
    transform: translate(-50%, 0);
  }

  z-index: 3;
  position: absolute;
  padding: 0.5rem;
  display: flex;

  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;

  left: 50%;
  bottom: 2.5%;

  width: 40%;
  min-height: 50px;

  border-radius: 16px;
  box-sizing: border-box;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  transform: translate(-50%, 200%);
  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
