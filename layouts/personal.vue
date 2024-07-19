<script setup lang="ts">
import Logo from '../components/chore/Logo.vue'
import AccountAvatar from '../components/personal/AccountAvatar.vue'

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
      <slot />
    </el-container>
  </el-container>
</template>

<style lang="scss">
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
