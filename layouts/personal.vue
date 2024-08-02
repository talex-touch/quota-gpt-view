<script setup lang="ts">
import Logo from '../components/chore/Logo.vue'
import AccountAvatar from '../components/personal/AccountAvatar.vue'
import CmsMenuItem from '~/components/cms/CmsMenuItem.vue'

const router = useRouter()

onMounted(() => {
  if (!userStore.value.token?.length) {
    ElMessage.error('未登录')

    router.back()
  }
})

const privacyPhone = computed(() => {
  const phone = userStore.value?.phone
  if (!phone)
    return ''

  return `${phone.substring(0, 3)}******${phone.substring(9)}`
})
</script>

<template>
  <el-container class="PersonalTemplate">
    <div class="PersonalWrapper">
      <div class="PersonalWrapper-Aside">
        <div class="PersonalWrapper-AsideHead">
          <AccountAvatar />
          <div class="head-text">
            <p> {{ userStore.nickname }}</p>
            <p op-75>
              +86 {{ privacyPhone }}
            </p>
          </div>
        </div>

        <div class="PersonalWrapper-AsideMenu">
          <p class="sub-title">
            基础信息
          </p>
          <CmsMenuItem path="/profile/base">
            <div i-carbon-user />账号资料
          </CmsMenuItem>
          <CmsMenuItem emphasis path="/profile/plan">
            <div i-carbon:document-multiple-01 />订阅计划
          </CmsMenuItem>
          <CmsMenuItem path="/profile/test">
            <div i-carbon-software-resource-cluster />我的内测
          </CmsMenuItem>
          <CmsMenuItem path="/profile/notification">
            <div i-carbon-notification />通知设置
          </CmsMenuItem>
          <CmsMenuItem path="/profile/appearance">
            <div i-carbon-moon />外观设置
          </CmsMenuItem>
        </div>

        <div class="PersonalWrapper-AsideMenu">
          <p class="sub-title">
            安全设置
          </p>
          <CmsMenuItem path="/profile/link">
            <div i-carbon-attachment />三方绑定
          </CmsMenuItem>
          <CmsMenuItem danger path="/profile/password">
            <div i-carbon-password />修改密码
          </CmsMenuItem>
          <CmsMenuItem path="/profile/history">
            <div i-carbon-data-table />登录历史
          </CmsMenuItem>
          <CmsMenuItem path="/profile/mf2a">
            <div i-carbon-tablet />MF2A
          </CmsMenuItem>
          <CmsMenuItem danger path="/profile/developer">
            <div i-carbon-code />开发者设置
          </CmsMenuItem>
        </div>
      </div>

      <div class="PersonalWrapper-Main">
        <el-scrollbar>
          <slot />
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

.PersonalWrapper {
  .el-scrollbar__view {
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
      position: relative;
      padding: 1rem 2rem;
      display: flex;

      align-items: center;
      justify-content: flex-end;

      height: 80px;
      width: 100%;

      font-weight: 600;
      // border-top: 1px solid var(--el-border-color);
    }

    .ProfileWrapper-Main {
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
        padding: 0.75rem 1.25rem;

        gap: 0.5rem;
        align-items: center;

        width: 100%;

        border-radius: 18px;
      }

      & > p.sub-title {
        margin: 0.5rem 0;
        width: 100%;

        opacity: 0.5;
        font-size: 14px;
        text-align: left;
        font-weight: 600;
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
    // border-right: 1px solid var(--el-border-color);
    backdrop-filter: blur(58px) saturate(180%);
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
  // border-radius: 18px;
  // box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
  // background: var(--el-mask-color-extra-lighter);
}

.PersonalTemplate {
  &::before {
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.5;
    background-size: cover;
    background-image: var(--wallpaper);
  }

  position: absolute;
  display: flex;

  align-items: center;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  height: 100%;

  // background-color: var(--el-bg-color-page);
}
</style>
