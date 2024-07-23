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
</script>

<template>
  <el-container class="DocumentTemplate">
    <el-header>
      <span flex items-center>
        <span class="head-start">
          <Logo />
          <span font-bold>ThisAI</span>
        </span>
        个人中心
      </span>

      <div class="head-end">
        <span class="name">{{ userStore.username }}
        </span>

        <AccountAvatar />
      </div>
    </el-header>
    <el-container>
      <div class="PersonalWrapper">
        <div class="PersonalWrapper-Aside">
          <p class="title">
            个人信息
          </p>

          <div class="PersonalWrapper-AsideMenu">
            <p class="sub-title">
              基础信息
            </p>
            <CmsMenuItem path="/profile/base">
              <div i-carbon-user />账号资料
            </CmsMenuItem>
            <CmsMenuItem path="/profile/email">
              <div i-carbon-email />邮箱设置
            </CmsMenuItem>
            <CmsMenuItem path="/profile/notification">
              <div i-carbon-notification />通知设置
            </CmsMenuItem>
            <CmsMenuItem path="/profile/appearance">
              <div i-carbon-moon />外观设置
            </CmsMenuItem>
            <CmsMenuItem path="/profile/language">
              <div i-carbon-language />语言设置
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
  </el-container>
</template>

<style lang="scss">
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
      position: relative;
      padding: 0 1rem;
      display: flex;

      flex-direction: column;
      justify-content: center;

      height: 80px;

      font-weight: 600;
      border-bottom: 1px solid var(--el-border-color);
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
      border-top: 1px solid var(--el-border-color);
    }

    .ProfileWrapper-Main {
      padding: 1.5rem 1rem;

      flex: 1;
    }

    .ProfileWrapper {
      position: relative;
      display: flex;

      flex-direction: column;

      width: 100%;
      height: 100%;
    }
    position: relative;
    display: flex;

    flex-direction: column;

    width: 100%;
    height: 100%;
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
    padding: 1.5rem 1rem;

    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    width: 240px;
    border-right: 1px solid var(--el-border-color);
  }
  position: relative;
  display: flex;

  top: 50%;
  left: 50%;

  width: 1080px;
  height: calc(80% - 61px - 2rem);

  transform: translate(-50%, -50%);

  overflow: hidden;
  border-radius: 18px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
}

.DocumentTemplate {
  .el-header {
    .head-start {
      margin-right: 1rem;
      padding-right: 1rem;

      display: flex;
      align-items: center;

      border-right: 1px solid var(--el-border-color);
    }

    .head-end {
      .name {
        position: relative;
        right: 50px;
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

    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
  }
  .el-container {
    width: 100%;
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
