<script setup lang="ts">
import { globalOptions } from '~/constants'

const router = useRouter()

const menus = reactive([
  {
    icon: 'i-carbon-user',
    label: '个人资料',
    show: true,
    click: () => {
      router.push('/profile/base')
    },
  },
  {
    icon: 'i-carbon-book',
    label: '使用指南',
    show: true,
    click: () => {
      router.push('/guide')
    },
  },
  {
    icon: 'i-carbon-settings-adjust',
    label: '系统设置',
    show: computed(() => userStore.value.isAdmin),
    click: () => {
      router.push('/cms')
    },
  },
  {
    label: '',
    divider: true,
    show: true,
  },
  {
    danger: true,
    icon: 'i-carbon-close-large',
    label: '退出登录',
    show: true,
    click: () => {
      userStore.value.token = ''

      location.reload()
    },
  },
])

const appOptions: any = inject('appOptions')!
const avatarUrl = computed(() => `${globalOptions.getEndsUrl()}${userStore.value.avatar}`)
</script>

<template>
  <div class="AccountAvatar">
    <div
      v-if="!userStore.token?.length" class="AccountAvatar-Wrapper"
      @click="appOptions.model.login = !appOptions.model.login"
    >
      <el-avatar>
        <span style="transform: scale(.75)">登录</span>
      </el-avatar>
    </div>

    <el-popover
      v-else :width="300" :show-arrow="false" popper-class="AccountAvatar-Float"
      popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
    >
      <template #reference>
        <div class="AccountAvatar-Wrapper" @click="router.push('/')">
          <el-avatar :src="avatarUrl" />
        </div>
      </template>
      <template #default>
        <div class="AccountAvatar-Head">
          <el-avatar :src="avatarUrl" />

          <p>
            <span class="name">{{ userStore.phone }} <span class="privilege">测试会员</span></span>
            <span class="dummy">99, 999 $</span>
          </p>
        </div>
        <div class="AccountAvatar-Selections" style="display: flex; gap: 16px; flex-direction: column">
          <div
            v-for="item in menus" :key="item.label" v-wave :class="{ danger: item.danger, divider: item.divider }"
            :style="`${item.show ? '' : 'display: none'}`"
            class="AccountAvatar-MenuItem" @click="item?.click"
          >
            <div v-if="item.icon" :class="item.icon" />
            {{ item.label }}
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss">
.AccountAvatar-MenuItem {
  &.divider {
    margin: 0 1rem;
    padding: 0;
    height: 2px;

    background: var(--el-border-color) !important;
  }

  .dark &:hover {
    background: #ffffff10;
  }

  &:hover {
    background: #00000010;
  }

  &.danger {
    &:hover {
      color: #fff;
      background: var(--el-color-danger);
    }
  }
  display: flex;
  padding: 0.5rem 1rem;

  gap: 0.5rem;
  cursor: pointer;
  transition: 0.25s;
  user-select: none;
  border-radius: 12px;
}

.AccountAvatar-Selections {
  margin: 1rem 0;
}

.AccountAvatar-Head {
  p {
    display: flex;

    align-items: center;
    flex-direction: column;

    .privilege {
      padding: 0.25rem 0.5rem;

      font-size: 12px;
      border-radius: 8px;
      // background: #ffca1a50;
      background: #fc487050;
    }

    .name {
      margin: 0.25rem 0;
      color: var(--el-text-color-primary);

      font-size: 16px;
    }
  }
  display: flex;

  gap: 1rem;
  align-items: center;
  flex-direction: column;

  .el-avatar {
    width: 72px;
    height: 72px;
  }
}

.AccountAvatar {
  &-Wrapper {
    .el-avatar {
      width: 28px;
      height: 28px;
    }

    cursor: pointer;
  }
  position: absolute;

  top: 5px;
  right: 1rem;
}

div.el-popper.AccountAvatar-Float {
  border: none;

  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow);
}
</style>
