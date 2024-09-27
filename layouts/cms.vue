<script setup lang="ts">
import { ENDS_URL, globalOptions } from '~/constants'

import { getAccountMenuList } from '~/composables/api/account'
import { $endApi } from '~/composables/api/base'

const { isChrome, isDesktop } = useDevice()
const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'cms',
  layoutTransition: {
    name: 'rotate',
  },
})

const cur = ref()

onBeforeMount(async () => {
  if (!userStore.value.isAdmin) {
    router.push('/')

    return false
  }

  if (isDesktop && !isChrome) {
    ElNotification({
      duration: 60000,
      title: '使用 Chrome 以继续',
      message: h('i', { style: 'color: teal' }, '请勿使用未受信任的浏览器操作！'),
    })

    router.back()
  }
})

const color = useColorMode()
const tabOptions = useLocalStorage<{
  active: string
  tabs: { name: string, path: string }[]
}>('tab-stashed', {
  active: '',
  tabs: [],
})
const font = reactive({
  color: 'rgba(0, 0, 0, .15)',
})

watch(
  color,
  () => {
    font.color = color.value === 'dark'
      ? 'rgba(255, 255, 255, .15)'
      : 'rgba(0, 0, 0, .15)'
  },
  {
    immediate: true,
  },
)

function clickTab(tab: any) {
  const tabPath = tab.paneName

  const selectTab = tabOptions.value.tabs.find(_tab => tabPath === _tab.path)

  if (selectTab)
    changeActiveRoute(tabOptions.value.active = selectTab.path)
}

function changeActiveRoute(path: string) {
  tabOptions.value.active = path

  router.push(path)
}

function removeTab(targetPath: any) {
  const tabs = tabOptions.value.tabs

  let activePath = tabOptions.value.active

  if (activePath === targetPath) {
    tabs.forEach((tab, index) => {
      if (tab.path === targetPath) {
        // 下一个 tab：索引-1或者索引+1
        const nextTab = tabs[index + 1] || tabs[index - 1]
        // 如果存在就激活 Tab，存储激活的 Tab，跳转页面
        if (nextTab) {
          activePath = nextTab.path
          changeActiveRoute(nextTab.path)
        }
        else {
          changeActiveRoute('/cms')
        }
      }
    })
  }

  tabOptions.value.active = activePath

  tabOptions.value.tabs = tabs.filter(tab => tab.path !== targetPath)
}

router.afterEach((to) => {
  const { path, name } = to
  if (path === tabOptions.value.active)
    return

  cur.value = name

  setTimeout(() => {
    changeActiveRoute(path)
    // tabOptions.value.active = path

    const index = tabOptions.value.tabs.findIndex(item => item.name === cur.value)

    if (index === -1)
      tabOptions.value.tabs.push({ path, name })
  }, 200)
})
</script>

<template>
  <el-container class="CmsTemplate">
    <CmsHeader :cur="cur" />
    <el-container class="CmsContainer">
      <el-main class="CmsMain">
        <div class="CmsMain-Tabs">
          <el-tabs
            v-if="tabOptions.tabs.length > 0" v-model="tabOptions.active" type="card" closable
            @tab-click="clickTab" @tab-remove="removeTab"
          >
            <el-tab-pane v-for="item in tabOptions.tabs" :key="item.path" :label="item.name" :name="item.path" />
          </el-tabs>
        </div>
        <el-watermark :font="font" :z-index="100" class="watermark" :content="[userStore.nickname!, 'ThisAI CMS']">
          <router-view v-slot="{ Component }">
            <transition name="rotate">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-watermark>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss">
.CmsMain-Tabs {
  .el-tabs__header {
    margin: 0;
  }

  background-color: var(--el-bg-color-page);
}

.CmsAside {
  .MenuIcon {
    &-Item {
      span {
        font-size: 12px;
      }
      div {
        flex: 1;
      }
      &:hover {
        color: var(--el-color-primary);
      }
      &.active {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
      padding: 0.5rem;
      display: flex;
      flex-direction: column;

      width: 64px;
      height: 64px;

      align-items: center;
      justify-content: space-between;

      cursor: pointer;
      border-radius: 8px;
      box-sizing: border-box;
      // background-color: var(--el-bg-color-page);
    }
    position: relative;
    padding: 0.5rem;
    gap: 0.5rem;

    display: flex;
    flex-direction: column;

    align-items: center;

    width: 96px;

    // background-color: var(--el-overlay-color);
    border-right: 1px solid var(--el-border-color);
  }
  .Menu-Sub {
    width: 100%;
  }
  .CmsMenuItem {
    &::after {
      content: '';
      position: absolute;

      top: 0;
      right: 0;
      width: 2px;

      height: 100%;

      transition: 0.25s;
      transform: scale(0);

      background-color: var(--el-color-primary);
    }
    &.select::after {
      transform: scale(1);
    }
    position: relative;
  }

  display: flex;

  background-color: var(--el-bg-color-page);
}

/* ... */
.rotate-enter-active,
.rotate-leave-active {
  position: absolute;

  width: 100%;

  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.rotate-enter-active {
  z-index: 10;

  transition: 0.5s 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.rotate-enter-from {
  position: absolute !important;

  opacity: 0;

  width: 100%;

  transform: translateX(-1%);
}

.rotate-leave-to {
  position: absolute !important;

  opacity: 0;

  transform: translateX(1%);
}

.CmsAside {
  .el-menu {
    height: 100%;
  }

  height: 100%;

  align-self: flex-start;
  border-right: 1px solid var(--el-border-color);
}

.CmsMain {
  position: relative;
  padding: 0;

  flex: 1;
  width: 100%;
  height: 100%;

  overflow: hidden;
  box-sizing: border-box;
  // background-color: var(--el-bg-color-page);
}

.CmsContainer {
  position: relative;

  width: 100%;
  height: 100%;

  flex: 1;
  overflow: hidden;

  .el-table__inner-wrapper {
    height: 100% !important;
  }
}

.CmsTemplate {
  .el-container {
    position: relative;
    display: flex;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  position: absolute;
  display: flex;

  align-items: center;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
