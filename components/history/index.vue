<script setup lang="ts">
import CloseCheckbox from '../button/CloseCheckbox.vue'
import type { ThHistory } from './history'

const props = defineProps<{
  expand: boolean
  selectIndex: number
  history: ThHistory[]
}>()

const emits = defineEmits<{
  (e: 'select', index: number): void
  (e: 'delete', index: number): void
}>()

const menus = reactive([
  {
    name: '编辑标题',
    icon: 'i-carbon-edit',
    trigger: (ind: number) => {},
  },
  {
    name: '分享记录',
    icon: 'i-carbon-share',
    trigger: (ind: number) => {},
  },
  {
    name: '删除记录',
    icon: 'i-carbon-close',
    danger: true,
    trigger: (ind: number) => {
      emits('delete', ind)
    },
  },
])

const { expand, selectIndex } = useVModels(props, emits)
const historyList = computed(() =>
  [...props.history]
    .map((item, ind) => ({
      ind,
      _hover: false,
      ...item,
    }))
    .sort((a, b) => b.lastUpdate - a.lastUpdate),
)
</script>

<template>
  <div class="History">
    <teleport to="body">
      <div :class="{ expand }" class="History-Indicator" @click="expand = !expand" />
    </teleport>

    <div class="History-Title">
      <h1>This!AI.</h1>
    </div>

    <div class="History-Wrapper">
      <el-scrollbar>
        <div class="History-Content">
          <div class="History-Content-Item active">
            新建聊天
          </div>
          <br>
          <div
            v-for="(item, index) in historyList"
            :key="index"
            :class="{ active: selectIndex === item.ind }"
            class="History-Content-Item"
            @click="selectIndex = item.ind"
          >
            {{ item.topic }}
            <div class="History-Content-Fixed">
              <el-popover
                transition="th-zoom"
                :show-arrow="false"
                popper-class="History-Content-MenuWrapper"
                placement="bottom-start"
                :width="200"
                trigger="hover"
              >
                <template #reference>
                  <div class="i-carbon:overflow-menu-horizontal" />
                </template>
                <div class="History-Content-MenuWrapper">
                  <div class="History-Content-Menu">
                    <div
                      v-for="menu in menus"
                      :key="menu.name"
                      :class="{ danger: menu.danger }"
                      class="History-Content-Menu-Item"
                      @click.stop="menu.trigger(item.ind)"
                    >
                      <div :class="menu.icon" />
                      <span v-html="menu.name" />
                    </div>
                  </div>
                </div>
              </el-popover>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div class="History-Bottom">
      <DarkToggle />
      <CloseCheckbox v-model="expand" />
    </div>
  </div>
</template>

<style lang="scss">
div.History {
  .el-scrollbar__bar.is-vertical {
    width: 3px;
  }
}

.th-zoom-enter-from,
.th-zoom-leave-to {
  transform: scale(0);
}

.History-Wrapper {
  &::before {
    z-index: 1;
    content: '';
    position: absolute;

    left: 0;
    bottom: 0px;

    width: 100%;
    height: 50px;

    pointer-events: none;
    background: linear-gradient(to top, var(--el-bg-color-page) 0%, #0000 100%);
  }
  position: relative;

  width: 100%;
  height: calc(100% - 50px);

  box-sizing: border-box;
}

.History-Indicator {
  &.expand {
    left: 270px;
  }
  &:hover {
    opacity: 0.75;
    height: 100px;

    cursor: pointer;
    transform: translateX(2px) translateY(-50%);
  }
  z-index: 2;
  position: absolute;

  top: 50%;
  left: 10px;

  width: 8px;
  height: 50px;

  opacity: 0.5;
  border-radius: 100px;
  transform: translateX(0px) translateY(-50%);
  background-color: var(--el-text-color-primary);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.History-Content-MenuWrapper {
  &.el-popover.el-popper {
    box-shadow: none !important;
    background: none !important;
    border: none !important;
  }

  user-select: none;
  // transform: scale(0);

  transform-origin: left top;

  transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.History-Content-Menu {
  &-Item {
    &:hover {
      opacity: 1;
      background: var(--el-bg-color-page);
    }
    &.danger {
      color: var(--el-color-danger);
    }
    display: flex;
    padding: 0.25rem 0.5rem;

    gap: 0.5rem;
    opacity: 0.75;
    font-size: 14px;
    align-items: center;
    border-radius: 8px;

    cursor: pointer;
  }
  position: absolute;
  padding: 0.5rem;
  display: flex;

  flex-direction: column;

  gap: 0.5rem;
  top: 0;
  left: 0;

  width: max-content;
  height: max-content;

  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  // backdrop-filter: blur(18px) saturate(180%);
}

.History-Content {
  &-Fixed {
    &:hover {
      background-color: #ffffff30;
    }
    z-index: 20;
    position: absolute;
    display: flex;

    align-items: center;
    justify-content: center;

    top: 50%;
    right: 1%;

    width: 32px;
    height: 32px;
    font-size: 20px;

    opacity: 0;
    border-radius: 12px;
    transform: translate(0, -50%);
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  &-Item {
    &:hover {
      .History-Content-Fixed {
        opacity: 1;
      }
      background-color: var(--el-bg-color-page);
    }
    &.active {
      color: var(--el-text-color-primary);
      background-color: var(--el-color-primary-light-5);
    }
    position: relative;
    padding: 0.5rem 0.5rem;

    font-size: 14px;
    cursor: pointer;
    border-radius: 12px;
    color: var(--el-text-color-secondary);
    // background-color: var(--el-bg-color-page);
  }
  position: relative;
  display: flex;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 80px;
  padding-bottom: 2rem;
  flex-direction: column;

  gap: 0.5rem;
}

.History {
  &-Title {
    z-index: 1;
    position: absolute;
    padding: 1rem 0;
    font-size: 24px;

    width: 100%;
    height: 70px;

    font-weight: 600;
    text-align: center;

    background-size: 4px 4px;
    background-image: radial-gradient(transparent 1px, var(--el-bg-color) 1px);
    backdrop-filter: saturate(50%) blur(4px);
  }
  &-Bottom {
    position: absolute;
    padding: 0.5rem;
    display: flex;

    align-items: center;
    justify-content: center;

    bottom: 0;

    width: 100%;
    height: 50px;

    box-sizing: border-box;
    // backdrop-filter: blur(18px) saturate(180%);
    background-color: var(--el-bg-color-page);
  }

  .expand & {
    margin-left: 0;

    width: 260px;

    opacity: 1;
    transform: translateX(0);

    pointer-events: all;
    transition:
      0.5s width cubic-bezier(0.785, 0.135, 0.15, 0.86),
      0.75s opacity cubic-bezier(0.785, 0.135, 0.15, 0.86),
      0.75s transform cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }
  z-index: 10;
  position: relative;
  margin-left: -1px;

  width: 0;

  height: 100%;

  opacity: 0;
  pointer-events: none;
  transform: translateX(-100%);
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition:
    0.75s width cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.5s opacity cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.25s transform cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
