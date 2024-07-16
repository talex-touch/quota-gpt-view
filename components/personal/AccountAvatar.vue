<script setup lang="ts">
const router = useRouter()

const menus = reactive([
  {
    icon: 'i-carbon-user',
    label: '个人资料',
    click: () => void 0,
  },
  {
    icon: 'i-carbon-book',
    label: '使用指南',
    click: () => {
      router.push('/guide')
    },
  },
  {
    icon: 'i-carbon-settings-adjust',
    label: '系统设置',
    click: () => void 0,
  },
  {
    label: '',
    divider: true,
  },
  {
    danger: true,
    icon: 'i-carbon-close-large',
    label: '退出登录',
    click: () => void 0,
  },
])

const pageOptions: any = inject('pageOptions')!
const login = false
</script>

<template>
  <div class="AccountAvatar">
    <div
      v-if="!login"
      class="AccountAvatar-Wrapper"
      @click="pageOptions.model.login = !pageOptions.model.login"
    >
      <el-avatar>
        <span style="transform: scale(.75)">登录</span>
      </el-avatar>
    </div>

    <el-popover
      v-else
      :width="300"
      :show-arrow="false"
      popper-class="AccountAvatar-Float"
      popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
    >
      <template #reference>
        <div
          class="AccountAvatar-Wrapper"
          @click="pageOptions.model.login = !pageOptions.model.login"
        >
          <el-avatar src="http://q1.qlogo.cn/g?b=qq&nk=3397743231&s=100" />
        </div>
      </template>
      <template #default>
        <div class="AccountAvatar-Head">
          <el-avatar size="large" src="http://q1.qlogo.cn/g?b=qq&nk=3397743231&s=100" />

          <p>
            <span class="name">Talex DS <span class="privilege">普通会员</span></span>
            <span class="dummy">99, 999 $</span>
          </p>
        </div>
        <div
          class="AccountAvatar-Selections"
          style="display: flex; gap: 16px; flex-direction: column"
        >
          <div
            v-for="item in menus"
            :key="item.label"
            v-wave
            :class="{ danger: item.danger, divider: item.divider }"
            class="AccountAvatar-MenuItem"
            @click="item?.click"
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
      background: #ffca1a50;
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
