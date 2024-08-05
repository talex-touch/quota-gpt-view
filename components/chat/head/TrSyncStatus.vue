<script lang="ts" setup>
import TextShaving from '~/components/other/TextShaving.vue'

defineProps < {
  sync: boolean
  syncing: boolean
}>()

const mobile = ref(false)

onMounted(() => {
  mobile.value = document.body.classList.contains('mobile')
})
</script>

<template>
  <teleport to=".PageContainer" :disabled="!mobile">
    <div :class="{ syncing, sync }" class="TrSyncStatus">
      <span class="sync-success">已同步</span>
      <span class="sync-none">未同步</span>
      <span class="sync-loading">
        <TextShaving text="正在同步" />
      </span>
    </div>
  </teleport>
</template>

<style style="scss">
.TrSyncStatus {
  .show & {
    opacity: 1;
  }

  span {
    position: absolute;

    transition: 0.25s;
  }

  .sync-none {
    opacity: 1;
    color: var(--el-color-danger);
  }

  .sync-success,
  .sync-loading {
    opacity: 0;
  }

  &.sync {
    .sync-success {
      opacity: 1;
    }

    .sync-none,
    .sync-loading {
      opacity: 0;
    }

    width: 63px;
  }

  &.syncing {
    .sync-success,
    .sync-none {
      opacity: 0;
    }

    .sync-loading {
      opacity: 1;
    }

    width: 77px;
  }

  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.5;
    border-radius: 12px;
    background-color: var(--el-mask-color-extra-light);
  }
  position: relative;
  padding: 0.25rem 0.5rem;

  width: 63px;
  height: 32px;
  border-radius: 12px;

  opacity: 0;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: var(--el-box-shadow);
  backdrop-filter: blur(16px) saturate(180%);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.mobile .TrSyncStatus {
  z-index: 5;
  position: absolute;
  padding: 0;

  top: 0;
  left: 0;

  width: 100%;
  height: 2px;

  opacity: 1;
  border-radius: 0;
  box-shadow: unset;
  backdrop-filter: unset;

  background-color: var(--el-color-danger);

  &.sync {
    background-color: var(--el-color-success);
  }

  &.syncing {
    animation: head_shining 1s infinite;
    background-color: var(--el-color-primary);
  }
}

@keyframes head_shining {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
