<script setup lang="ts">
import AccountAvatar from '../components/personal/AccountAvatar.vue'
import CmsMenuItem from '~/components/cms/CmsMenuItem.vue'

import Account from '~/components/chore/personal/profile/Account.vue'
import Plan from '~/components/chore/personal/profile/Plan.vue'
import empty from '~/components/chore/personal/profile/empty.vue'
import History from '~/components/chore/personal/profile/History.vue'
import Appearance from '~/components/chore/personal/profile/Appearance.vue'
import Developer from '~/components/chore/personal/profile/Developer.vue'
import Link from '~/components/chore/personal/profile/Link.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const show = useVModel(props, 'modelValue', emits)

const route = useRoute()

const privacyPhone = computed(() => {
  const phone = userStore.value?.phone
  if (!phone)
    return ''

  return `${phone.substring(0, 3)}******${phone.substring(9)}`
})

const comp = ref()
const expand = ref(false)
const queryComponentMapper: Record<string, any> = {
  account: Account,
  plan: Plan,
  link: Link,
  appearance: Appearance,
  history: History,
  developer: Developer,
  notification: empty,
}

watch(
  () => route.fullPath,
  () => {
    const data = route.query.data

    if (data) {
      show.value = true
      expand.value = data === 'plan'
    }
    else {
      show.value = false
      return
    }

    comp.value = queryComponentMapper[data as string]
  },
  { immediate: true },
)
</script>

<template>
  <el-container :class="{ show, expand }" class="PersonalTemplate">
    <div class="BuyDialog-Close" @click="$router.push('/')">
      <div i-carbon:close />
    </div>

    <div class="PersonalWrapper">
      <div class="PersonalWrapper-Aside">
        <div class="PersonalWrapper-AsideHead">
          <AccountAvatar />
          <div class="head-text">
            <p>{{ userStore.nickname }}</p>
            <p op-75>
              +86 {{ privacyPhone }}
            </p>
          </div>
        </div>

        <div class="PersonalWrapper-AsideMenu">
          <CmsMenuItem query="account">
            <div i-carbon-user />
            账号资料
          </CmsMenuItem>
          <CmsMenuItem emphasis query="plan">
            <div i-carbon:document-multiple-01 />
            订阅计划
          </CmsMenuItem>
          <!-- <CmsMenuItem path="/profile/test">
            <div i-carbon-software-resource-cluster />我的内测
          </CmsMenuItem> -->
          <CmsMenuItem query="notification">
            <div i-carbon-notification />
            通知设置
          </CmsMenuItem>
          <CmsMenuItem query="appearance">
            <div i-carbon-moon />
            外观设置
          </CmsMenuItem>
          <CmsMenuItem query="link">
            <div i-carbon-attachment />
            三方绑定
          </CmsMenuItem>
          <!-- <CmsMenuItem danger path="/profile/password">
            <div i-carbon-password />修改密码
          </CmsMenuItem> -->
          <CmsMenuItem query="history">
            <div i-carbon-data-table />
            登录历史
          </CmsMenuItem>
          <!-- <CmsMenuItem path="/profile/mf2a">
            <div i-carbon-tablet />MF2A
          </CmsMenuItem> -->
          <CmsMenuItem danger query="developer">
            <div i-carbon-code />
            开发者设置
          </CmsMenuItem>
        </div>
      </div>

      <div class="PersonalWrapper-Main">
        <el-scrollbar v-if="comp">
          <component :is="comp" />
        </el-scrollbar>
      </div>
    </div>
  </el-container>
</template>

<style lang="scss">
.PersonalWrapper-AsideHead {
  .AccountAvatar {
    .el-avatar {
      width: 100%;
      height: 100%;
    }

    position: relative;

    width: 36px;
    height: 36px;

    top: unset;
    right: unset;
  }

  padding: 1rem 0;
  display: flex;

  gap: 1rem;
  align-items: center;

  width: 100%;

  // border-bottom: 1px solid var(--wallpaper-color-light, var(--el-border-color));
}

.BuyDialog-Close {
  &:hover {
    color: var(--el-color-danger);
  }
  z-index: 1;
  position: absolute;
  display: flex;

  top: 0;
  right: 0;

  width: 24px;
  height: 24px;

  cursor: pointer;

  align-items: center;
  justify-content: center;

  border-radius: 50%;
  transform: translate(50%, -50%);
  background-color: var(--el-bg-color-page);
}

.PersonalWrapper {
  .el-scrollbar__view {
    position: relative;
    display: flex;

    width: 100%;
    height: 100%;

    align-items: center;
    justify-content: center;
  }

  .el-scrollbar__bar.is-vertical {
    width: 3px;
  }

  .el-input {
    --el-input-border-radius: 12px;
  }

  .el-button {
    border-radius: 12px;
  }

  &-Main {
    .ProfileWrapper-Header {
      z-index: 2;
      position: sticky;
      padding: 0.5rem 1rem;
      display: flex;

      flex-direction: column;
      justify-content: center;

      top: 0;
      height: 80px;
      width: 100%;

      font-weight: 600;
      font-size: 1.5rem;
      background-color: var(--el-bg-color-page);
      // border-bottom: 1px solid var(--el-border-color);
    }

    .ProfileWrapper-Footer {
      z-index: 2;
      position: sticky;
      padding: 1rem 2rem;
      display: flex;

      align-items: center;
      justify-content: flex-start;

      height: 80px;
      width: 100%;

      bottom: -1px;
      font-weight: 600;
      background-color: var(--el-bg-color-page);
      // border-top: 1px solid var(--el-border-color);
    }

    .ProfileWrapper-Main {
      z-index: 1;

      flex: 1;

      padding: 1.5rem 2rem;
    }

    .ProfileWrapper {
      position: relative;
      display: flex;

      flex-direction: column;

      width: 100%;
      height: 100%;
    }

    position: relative;
    // padding: 0.5rem 1rem;
    display: flex;

    flex-direction: column;

    width: 100%;
    height: 100%;

    overflow: hidden;
    border-radius: 0 16px 16px 0;
    background-color: var(--el-bg-color-page);
    // backdrop-filter: blur(8px) saturate(180%);
  }

  &-Aside {
    & > p.title {
      margin: 0 0 1rem;

      width: 100%;

      font-size: 18px;
      text-align: left;
      font-weight: 600;
    }

    .PersonalWrapper-AsideMenu {
      & > .CmsMenuItem {
        padding: 0.75rem 1rem;

        gap: 0.5rem;
        align-items: center;

        width: 100%;

        border-radius: 18px;
      }

      display: flex;
      margin: 1rem 0;

      width: 100%;

      gap: 0.5rem;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }

    display: flex;
    padding: 1rem 1rem;

    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    width: 320px;
    border-radius: 16px 0 0 16px;
    border-right: 1px solid var(--el-border-color);
    backdrop-filter: blur(18px) saturate(180%);
    background-color: var(--el-mask-color-extra-light);
  }

  position: relative;
  display: flex;

  top: 50%;
  left: 50%;

  width: 100%;
  height: 100%;
  // height: calc(100% - 61px);

  transform: translate(-50%, -50%);

  overflow: hidden;
  border-radius: 18px;
  // box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
  // background: var(--el-mask-color-extra-lighter);
}

.PersonalTemplate {
  &.expand {
    width: min(1280px, 100%);
    height: min(950px, 95%);
  }
  &.show {
    // opacity: 1;
    visibility: unset;
    pointer-events: all;
    transform: translate(-50%, -50%);
  }
  // &::before {
  //   content: '';
  //   position: absolute;

  //   top: 0;
  //   left: 0;

  //   width: 100%;
  //   height: 100%;

  //   opacity: 0.5;
  //   border-radius: 16px;
  //   background-size: cover;
  //   background-image: var(--wallpaper);
  // }
  z-index: 3;
  position: absolute;
  display: flex;

  align-items: center;
  flex-direction: column;
  justify-content: center;

  width: max(1080px, 60%);
  height: max(720px, 70%);

  top: 50%;
  left: 50%;

  // overflow: hidden;
  // opacity: 0;
  visibility: hidden;
  pointer-events: none;
  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
  transform: translate(-50%, -200%);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
