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
  modelValue: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const data = useVModel(props, 'modelValue', emits)
const show = ref(false)

const route = useRoute()
// const router = useRouter()

const privacyPhone = computed(() => {
  const phone = userStore.value?.phone
  if (!phone)
    return ''

  return `${phone.substring(0, 3)}******${phone.substring(9)}`
})

const comp = ref()
const expand = ref(false)
const queryComponentMapper: Record<string, any> = {
  account: {
    name: '账号资料',
    comp: Account,
  },
  plan: {
    name: '订阅计划',
    comp: Plan,
  },
  link: {
    name: '三方绑定',
    comp: Link,
  },
  appearance: {
    name: '外观设置',
    comp: Appearance,
  },
  history: {
    name: '登录历史',
    comp: History,
  },
  developer: {
    name: '开发者设置',
    comp: Developer,
  },
  // notification: empty,
}

watch(() => data.value, (_data) => {
  if (_data) {
    show.value = true

    if (!document.body.classList.contains('mobile') && _data === 'index')
      data.value = 'account'

    expand.value = _data === 'plan'
  }
  else {
    show.value = false
    return
  }

  comp.value = queryComponentMapper[_data as string]
})

function handleClose() {
  data.value = ''
  // router.push({ query: { ...route.query, c: null, data: null } })
}

function handleBack() {
  if (data.value === 'index')
    handleClose()
  else data.value = 'index'
}
</script>

<template>
  <el-container :class="{ show, expand }" class="PersonalTemplate">
    <div class="PersonalTemplate-Background only-pe-display" />

    <div class="PersonalTemplate-MainHead only-pe-display">
      <div i-carbon:arrow-left @click="handleBack" />
      <div class="head-text">
        <p>
          <OtherTextTransformer :text="comp?.name || '个人资料'" />
        </p>
      </div>
      <div i-carbon:arrow-left op-0 />
    </div>
    <div class="PersonalDialog-Close" @click="handleClose">
      <div i-carbon:close />
    </div>

    <div class="PersonalWrapper">
      <div :class="{ hide: comp }" class="PersonalWrapper-Aside">
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
          <CmsMenuItem :active="data === 'account'" @click="data = 'account'">
            <div i-carbon-user />
            账号资料
          </CmsMenuItem>
          <CmsMenuItem :active="data === 'plan'" emphasis @click="data = 'plan'">
            <div i-carbon:document-multiple-01 />
            订阅计划
          </CmsMenuItem>
          <!-- <CmsMenuItem path="/profile/test">
            <div i-carbon-software-resource-cluster />我的内测
          </CmsMenuItem> -->
          <!-- <CmsMenuItem query="notification">
            <div i-carbon-notification />
            通知设置
          </CmsMenuItem> -->
          <CmsMenuItem :active="data === 'appearance'" @click="data = 'appearance'">
            <div i-carbon-moon />
            外观设置
          </CmsMenuItem>
          <CmsMenuItem :active="data === 'link'" @click="data = 'link'">
            <div i-carbon-attachment />
            三方绑定
          </CmsMenuItem>
          <!-- <CmsMenuItem danger path="/profile/password">
            <div i-carbon-password />修改密码
          </CmsMenuItem> -->
          <CmsMenuItem :active="data === 'history'" @click="data = 'history'">
            <div i-carbon-data-table />
            登录历史
          </CmsMenuItem>
          <!-- <CmsMenuItem path="/profile/mf2a">
            <div i-carbon-tablet />MF2A
          </CmsMenuItem> -->
          <CmsMenuItem v-permission="'system:admin'" :active="data === 'developer'" danger @click="data = 'developer'">
            <div i-carbon-code />
            开发者设置
          </CmsMenuItem>
        </div>

        <div class="PersonalWrapper-AsideFooter only-pe-display">
          <ChoreVersionBar />
          <OtherPoweredBy />
        </div>
      </div>

      <div :class="{ enter: comp }" class="PersonalWrapper-Main">
        <el-scrollbar v-if="comp">
          <component :is="comp.comp" />
        </el-scrollbar>
      </div>
    </div>
  </el-container>
</template>

<style lang="scss">
.privacy .head-text {
  filter: blur(5px);
}

.PersonalWrapper-AsideFooter {
  position: absolute;
  display: flex;

  bottom: 1rem;

  font-size: 14px;
  flex-direction: column;
  align-items: center;
}

.PersonalTemplate-Background {
  position: absolute;

  top: 0;
  width: 100%;
  height: 30%;

  background-image: url('/svg/back-wave.svg');
  background-repeat: no-repeat;
}

.PersonalTemplate-MainHead {
  z-index: 1;
  position: relative;
  padding: 1rem;
  display: flex;

  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  top: 0;
  width: 100%;

  backdrop-filter: blur(18px) saturate(180%);
  background-color: var(--el-mask-color-extra-light);
}

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

    .mobile & {
      width: 5rem;
      height: 5rem;
    }
  }

  .mobile & {
    flex-direction: column;
  }

  padding: 1rem 0;
  display: flex;

  gap: 1rem;
  align-items: center;

  width: 100%;

  // border-bottom: 1px solid var(--wallpaper-color-light, var(--el-border-color));
}

.PersonalDialog-Close {
  &:hover {
    color: var(--el-color-danger);
  }

  .mobile & {
    display: none;
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

      .mobile & {
        bottom: 1rem;
      }
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

    .mobile & {
      &.enter {
        transform: translateX(0);
      }

      .ProfileWrapper-Header {
        display: none;
      }

      position: absolute;

      border-radius: 0;
      transform: translateX(150%);
      background-color: transparent;
      transition: transform 0.3s ease-in-out;

      backdrop-filter: blur(18px) saturate(180%);
      background-color: var(--el-mask-color-extra-light);
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
    .mobile & {
      &.hide {
        transform: translateX(-100%);
        transition: 0.1s 0.15s;
      }

      .CmsMenuItem {
        margin: 0.25rem 0;

        background: var(--el-bg-color-page);
        // border-bottom: 1px solid var(--el-border-color);
      }

      width: 100%;

      border-radius: 0;
      transition: 0.2s;
      // background-color: var(--el-bg-color-page);
    }

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

  .mobile & {
    margin-top: -1.25rem;

    border-radius: 0;
  }

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
  transform: translate(-50%, 200%);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);

  .mobile & {
    z-index: 10000;

    width: 100%;
    height: 100%;

    border-radius: unset;
    transform: translate(200%, -50%);
    background-color: var(--el-bg-color);
  }

  .mobile &.show {
    transform: translate(-50%, -50%);
  }
}
</style>
