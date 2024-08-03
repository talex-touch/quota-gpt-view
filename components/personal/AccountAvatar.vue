<script setup lang="ts">
import dayjs from 'dayjs'
import { formatDate } from '~/composables/common'
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

const planProgress = computed(() => {
  if (!userStore.value.subscription)
    return null

  const { startDate, endDate } = userStore.value.subscription

  // 将 2024-08-03 转换成 date对象
  const startDateObj = dayjs(startDate)
  const endDateObj = dayjs(endDate)

  function calculateExpiry(expiryDate: Date) {
    const now = dayjs()
    const expiry = dayjs(expiryDate)
    const diff = expiry.diff(now)

    const years = expiry.diff(now, 'year')
    const months = expiry.diff(now, 'month') % 12
    const days = expiry.diff(now, 'day') % 30
    const hours = expiry.diff(now, 'hour') % 24
    const minutes = expiry.diff(now, 'minute') % 60

    if (diff > 0) {
      if (years > 0)
        return `${years}年 后到期`

      else if (months > 0)
        return `${months}月 后到期`

      else if (days > 0)
        return `${days}天 后到期`

      else if (hours > 0)
        return `${hours}小时 后到期`

      else
        return `${minutes}分钟 后到期`
    }
    else {
      return '已过期'
    }
  }

  const startTimeStamp = startDateObj.toDate().getTime()
  const endTimeStamp = endDateObj.toDate().getTime()

  const total = endTimeStamp - startTimeStamp
  const diff = Date.now() - startTimeStamp
  const progress = Math.round((diff / total) * 100)

  const text = calculateExpiry(endDateObj.toDate())

  return { text, progress }
})
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
        <div :class="[userStore.subscription.type]" class="AccountAvatar-Head">
          <el-avatar :src="avatarUrl" />

          <p flex items-center>
            <span class="name">{{ userStore.nickname }} <span class="privilege">
              <span v-if="!userStore.subscription">免费订阅</span>
              <span v-else-if="userStore.subscription.type === 'ULTIMATE'">高级订阅</span>
              <span v-else-if="userStore.subscription.type === 'STANDARD'">标准订阅</span>
            </span>
              <span mx-2 style="--c: #FB533080" class="privilege"> <span class="dummy">0.00 ￥</span></span>
            </span>
            <span v-if="planProgress && planProgress" class="plan">
              <span class="progress-bar" :style="`--w: ${100 - planProgress.progress}%`" />
              <span w-full flex items-center justify-center gap-2>{{ planProgress.text }}<el-link v-if="planProgress.progress >= 30" type="primary">立即续费</el-link></span>
            </span>
          </p>
        </div>
        <div class="AccountAvatar-Selections" style="display: flex; gap: 16px; flex-direction: column">
          <div
            v-for="item in menus" :key="item.label" v-wave :class="{ danger: item.danger, divider: item.divider }"
            :style="`${item.show ? '' : 'display: none'}`" class="AccountAvatar-MenuItem" @click="item?.click"
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

@keyframes shining_shadow {
  0%,
  100% {
    box-shadow: 0 0 4px 2px var(--c);
  }
  50% {
    box-shadow: 0 0 16px 4px var(--c);
  }
}

.AccountAvatar-Head {
  &.ULTIMATE {
    --c: #299b4850;
  }

  &.STANDARD {
    --c: #306df750;
  }

  &.DEV {
    --c: #fc487050;
  }

  .el-avatar {
    box-shadow: 0 0 12px 2px var(--c);

    animation: shining_shadow 5s infinite linear;
  }

  p {
    display: flex;

    align-items: center;
    flex-direction: column;

    .privilege {
      padding: 0.25rem 0.5rem;

      font-size: 12px;
      border-radius: 8px;
      // background: #ffca1a50;
      background: var(--c, #21384c50);
    }

    .name {
      margin: 0.25rem 0;
      color: var(--el-text-color-primary);

      font-size: 16px;
    }

    .plan {
      .progress-bar {
        &::before {
          content: '';
          position: absolute;
          display: block;

          top: 0;
          left: 0;

          height: 100%;
          width: 100%;

          opacity: 0.5;
          border-radius: 4px;
          background-color: var(--c);
        }
        &::after {
          content: '';
          position: absolute;
          display: block;

          top: 0;
          left: 0;

          height: 100%;
          width: var(--w);

          border-radius: 4px 0 0 4px;
          background-color: var(--c);
        }
        position: relative;
        margin: 0.25rem 0;
        display: block;

        width: 100%;
        height: 10px;

        overflow: hidden;
        // background-color: var(--theme-color);
      }
      position: relative;
      margin: 0.5rem 0;

      width: 100%;

      text-align: center;
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
