<script setup lang="ts">
import Logo from '../components/chore/Logo.vue'
import AccountAvatar from '../components/personal/AccountAvatar.vue'
import CmsMenu from '~/components/cms/CmsMenu.vue'
import { ENDS_URL, globalOptions } from '~/constants'

import { getAccountMenuList } from '~/composables/api/account'
import { $endApi } from '~/composables/api/base'

const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'cms',
  layoutTransition: {
    name: 'rotate',
  },
})

const cur = ref()
watch(() => route.fullPath, () => {
  cur.value = route.meta?.name
}, { immediate: true })

const menus = ref()
const menuOpened = ref<any[]>([])
onBeforeMount(async () => {
  const res = await getAccountMenuList()

  // 将menu的每一项都排序 (orderNo)
  function _sort(arr: any[]) {
    return arr.sort((a, b) => b.orderNo - a.orderNo)
  }

  menus.value = _sort(res.data).map((item: any) => {
    if (item.children)
      _sort(item.children) && menuOpened.value.push(item.path)

    return item
  })
})

const color = useColorMode()

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

const endUrl = ref(globalOptions.getEndsUrl())

watch(() => endUrl.value, async (val) => {
  globalOptions.setEndsUrl(val)

  const res = await $endApi.v1.auth.serverStatus()

  if (res.code !== 200 || res.message !== 'success') {
    const result = await ElMessageBox.confirm('当前环境地址异常，仍然切换吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    if (result !== 'confirm')
      return
  }

  setTimeout(() => location.reload(), 500)
})

function filterSubMenus(menu: any) {
  return [...menu].filter(item => item.meta?.show)
}

router.beforeEach(() => {
  if (!userStore.value.isAdmin) {
    router.push('/')

    return false
  }
})

const curMenu = ref()
const select = computed(() => {
  // 根据 route 来判断当前选中的是哪个menu 以及对应的parent
  const path = route.fullPath.replace('/cms', '')

  const result = [...(menus.value || [])].filter(item => path.startsWith(item.path))
  if (!result.length)
    return null

  const item = result.at(-1)

  console.log(item)

  return item
})

watch(() => select.value, val => curMenu.value = val)
</script>

<template>
  <el-container class="CmsTemplate">
    <el-header>
      <span flex items-center>
        <span class="head-start">
          <Logo />
          <span font-bold>科塔智爱</span>
        </span>

        <el-breadcrumb>
          <el-breadcrumb-item :to="{ path: '/cms/' }">
            管理中心
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="cur">
            {{ cur }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </span>

      <div class="head-end">
        <!-- 设置全局环境地址 -->
        <el-select v-model="endUrl" placeholder="选择系统环境" style="width: 200px">
          <el-option
            v-for="item in Object.values(ENDS_URL)" :key="item.value" :label="item.label"
            :value="item.value"
          />
        </el-select>

        <AccountAvatar />
      </div>
    </el-header>
    <el-container class="CmsContainer">
      <el-aside class="CmsAside" width="280px">
        <div class="MenuIcon">
          <div v-for="item in menus" :key="item.id" :class="{ active: curMenu?.id === item.id }" class="MenuIcon-Item" @click="curMenu = item">
            <div :class="item.meta.icon" />
            <span>{{ item.name }}</span>
          </div>
        </div>
        <div class="Menu-Sub">
          <div class="Menu-Sub-Container">
            <template v-if="curMenu?.children">
              <CmsMenuItem
                v-for="subMenu in filterSubMenus(curMenu.children)" :key="subMenu.id"
                :path="`/cms${subMenu.path}`"
              >
                <div flex items-center gap-2>
                  <div :class="subMenu.meta.icon" />{{ subMenu.name }}
                </div>
              </CmsMenuItem>
            </template>
          </div>
        </div>

        <!-- <template v-for="item in menus" :key="item.id">
          <CmsMenu v-if="false && item.children?.length" :expandable="item.children?.length">
            <template #header>
              <div :class="item.meta.icon" />
              <span>{{ item.name }}</span>
            </template>
            <CmsMenuItem
              v-for="subMenu in filterSubMenus(item.children)" :key="subMenu.id"
              :path="`/cms${subMenu.path}`"
            >
              <div flex items-center gap-2>
                <div :class="subMenu.meta.icon" />{{ subMenu.name }}
              </div>
            </CmsMenuItem>
          </CmsMenu>
          <CmsMenuItem v-else :key="item.id" :path="`/cms${item.path}`">
            <div flex items-center gap-2>
              <div :class="item.meta.icon" />{{ item.name }}
            </div>
          </CmsMenuItem>
        </template> -->
      </el-aside>
      <el-main class="CmsMain">
        <el-watermark :font="font" :z-index="100" class="watermark" :content="[userStore.nickname!, 'ThisAI CMS']">
          <slot />
        </el-watermark>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss">
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
    padding: 0.5rem;
    gap: 0.5rem;

    display: flex;
    flex-direction: column;

    align-items: center;

    width: 96px;

    background-color: var(--el-bg-color-overlay);
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
  border: 1px solid var(--el-border-color);
}

.CmsMain {
  position: relative;

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

  overflow: hidden;
}

.CmsTemplate {
  .el-header {
    .head-start {
      margin-right: 1rem;
      padding-right: 1rem;

      display: flex;
      align-items: center;

      border-right: 1px solid var(--el-border-color);
    }

    .head-end {
      .el-select {
        &__wrapper {
          box-shadow: none;
          border-radius: 8px;
          background: var(--el-fill-color);
        }

        // &-group__append {
        //   position: relative;
        //   padding: 0 10px;
        //   margin: auto 0;
        //   margin-right: 0.5rem;

        //   height: 20px;

        //   font-size: 12px;
        //   box-shadow: none;
        //   // background: var(--el-bg-color);
        //   border-radius: 4px;

        //   box-sizing: border-box;
        // }

        right: 50px;

        background: var(--el-fill-color);
        border-radius: 8px;
      }
    }

    .AccountAvatar-Wrapper {
      margin-top: 7px;

      .el-avatar {
        width: 36px;
        height: 36px;
      }
    }
    z-index: 1;

    padding: 0 1rem;
    display: flex;

    align-items: center;
    justify-content: space-between;

    width: 100%;

    box-shadow: var(--el-box-shadow);
    // border-bottom: 1px solid var(--el-border-color);
  }

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
