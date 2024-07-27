<script setup lang="ts">
import type { TabPaneName } from 'element-plus'
import Logo from '../components/chore/Logo.vue'
import AccountAvatar from '../components/personal/AccountAvatar.vue'
import CmsMenu from '~/components/cms/CmsMenu.vue'

import { getAccountMenuList, getMenuList } from '~/composables/api/account'

const route = useRoute()

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
</script>

<template>
  <el-container class="CmsTemplate">
    <el-header>
      <span flex items-center>
        <span class="head-start">
          <Logo />
          <span font-bold>ThisAI</span>
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
        <el-input placeholder="搜索功能...">
          <template #append>
            Ctrl+K
          </template>
        </el-input>

        <AccountAvatar />
      </div>
    </el-header>
    <el-container class="CmsContainer">
      <el-aside class="CmsAside" width="240px">
        <template v-for="item in menus" :key="item.id">
          <CmsMenu v-if="item.children?.length" :expandable="item.children?.length">
            <template #header>
              <div :class="item.meta.icon" />
              {{ item.name }}
            </template>
            <CmsMenuItem v-for="subMenu in item.children" :key="subMenu.id" :path="`/cms${subMenu.path}`">
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
        </template>
      </el-aside>
      <el-main class="CmsMain">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss">
/* ... */
.rotate-enter-active,
.rotate-leave-active {
  position: absolute;

  width: 100%;

  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.rotate-enter-active {
  transition: 0.5s 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.rotate-enter-active {
  z-index: 10;
}

.rotate-enter-from {
  opacity: 0;

  transform: translateX(-1%);
}

.rotate-leave-to {
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
      .el-input {
        &__wrapper {
          box-shadow: none;
          border-radius: 8px 0 0 8px;
          background: var(--el-fill-color);
        }

        &-group__append {
          position: relative;
          padding: 0 10px;
          margin: auto 0;
          margin-right: 0.5rem;

          height: 20px;

          font-size: 12px;
          box-shadow: none;
          // background: var(--el-bg-color);
          border-radius: 4px;

          box-sizing: border-box;
        }

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

    padding: 0 1rem;
    display: flex;

    align-items: center;
    justify-content: space-between;

    width: 100%;

    border-bottom: 1px solid var(--el-border-color);
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
