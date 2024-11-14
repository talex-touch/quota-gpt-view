<script setup lang="ts">
import dayjs from 'dayjs'
import AccountModuleLink from './account/AccountModuleLink.vue'
import AccountModuleDeveloper from './account/AccountModuleDeveloper.vue'
import AccountModuleHistory from './account/AccountModuleHistory.vue'

import AccountModulePersonal from './account/AccountModulePersonal.vue'
import AccountModuleFortune from './account/AccountModuleFortune.vue'
import AccountModuleInvitation from './account/AccountModuleInvitation.vue'
import AccountModulePlan from './account/AccountModulePlan.vue'
import { getHistoryList } from '~/composables/api/account'
import ImageUpload from '~/components/personal/ImageUpload.vue'
import { $event } from '~/composables/events'
import { $endApi } from '~/composables/api/base'

const historyList = ref()
const invitationList = ref()
const shareList = ref()
const fortuneList = ref()

async function fetchHistoryData() {
  const res: any = await getHistoryList()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  historyList.value = res.data
}

async function fetchInvitationData() {
  const res: any = await $endApi.v1.account.getInvitationRecords()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  invitationList.value = res.data
}

async function fetchShareListData() {
  const res: any = await $endApi.v1.aigc.getShareList()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  shareList.value = res.data
}

async function fetchFortuneListData() {
  const res: any = await $endApi.v1.account.dailyFortune()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  fortuneList.value = res.data

  if (fortuneList.value.content)
    fortuneList.value.content = JSON.parse(decodeText(fortuneList.value.content) || '[]')
}

onMounted(() => {
  fetchHistoryData()
  fetchInvitationData()
  fetchShareListData()
  fetchFortuneListData()
})

// 计算注册了多少天
const registeredCountDay = computed(() => {
  const diff = Date.now() - new Date(userStore.value.createdAt!).getTime()

  return Math.round(diff / 60 / 1000 / 60 / 24)
})

function handleLogout() {
  $event.emit('USER_LOGOUT_SUCCESS', LogoutType.USER_LOGOUT)
}

const dialogOptions = reactive<{
  visible: boolean
  loading: boolean
  component: any
  data: any
}>({
  visible: false,
  loading: false,
  component: null,
  data: null,
})

async function openHistoryPage() {
  Object.assign(dialogOptions, {
    visible: true,
    component: AccountModuleHistory,
    data: historyList.value,
  })
}

async function openConfigurePage() {
  Object.assign(dialogOptions, {
    visible: true,
    component: AccountModulePersonal,
    data: null,
  })
}

async function openFortunePage() {
  Object.assign(dialogOptions, {
    visible: true,
    component: AccountModuleFortune,
    data: fortuneList.value,
  })
}

async function openInvitationPage() {
  Object.assign(dialogOptions, {
    visible: true,
    component: AccountModuleInvitation,
    data: invitationList.value,
  })
}

async function openPlanPage() {
  Object.assign(dialogOptions, {
    visible: true,
    component: AccountModulePlan,
    data: null,
  })
}

function handleShareMenu() {
  ElMessage.error('暂未开放.')
}
</script>

<template>
  <div class="ProfileAccount">
    <div style="--d: 0.1s" class="ProfileAccount-Box">
      <div class="ProfileAccount-Box-Header template-normal">
        <div class="image">
          <div i-carbon:user />
        </div>
        <div flex class="title">
          我的账号
        </div>
        <p class="subtitle">
          您的账号信息、第三方账号绑定信息等
        </p>
      </div>

      <div class="ProfileAccount-Box-Main">
        <div v-if="userStore" class="template-normal">
          <div class="image">
            <!-- <ImageUpload v-model="userStore.avatar!" /> -->
            <PersonalUserAvatar :avatar="userStore.avatar!" />
          </div>
          <div flex cursor-pointer items-center gap-2 class="title">
            <p v-copy="userStore.nickname" hover:underline>
              {{ userStore.nickname }}
            </p>
            <div v-if="false" i-carbon:edit op-50 hover:op-75 />
          </div>
          <p class="subtitle">
            {{ userStore.remark || '酷酷的人没有签名' }}
          </p>
        </div>

        <div class="ProfileAccount-Tags">
          <span v-if="!userStore.isAdmin" class="tag danger fill">管理员
          </span>
          <span v-else class="tag fill">普通用户</span>
          <span v-wave cursor-pointer class="tag" @click="openInvitationPage">已邀请 {{ invitationList?.length || 0 }}
            人</span>
          <span v-if="fortuneList" v-wave cursor-pointer class="tag" @click="openFortunePage">
            <span v-if="fortuneList.main === '大吉'">运势极佳 · 五福临门</span>
            <span v-if="fortuneList.main === '中吉'">运势上好</span>
            <span v-if="fortuneList.main === '小吉'">运势不错</span>
            <span v-if="fortuneList.main === '凶'">小心行事</span>
            <span v-if="fortuneList.main === '大凶'">多多行善</span>
            <span v-if="fortuneList.main === '极恶'">天打雷劈</span>
          </span>
          <span class="tag">注册 {{ registeredCountDay }} 天</span>
        </div>

        <div class="ProfileAccount-Box-Data">
          <div v-wave class="box-data">
            <div class="title">
              <p>钱包余额</p>
              <div i-carbon:cloud />
            </div>

            <p>0.00</p>
          </div>
          <div v-wave class="box-data" @click="openPlanPage">
            <div class="title">
              <p>订阅计划</p>
              <div i-carbon:document-multiple-01 />
            </div>

            <p>
              <span v-if="!userStore.subscription">暂无</span>
              <span v-else-if="userStore.subscription.type === 'STANDARD'">
                标准订阅
              </span>
              <span v-else-if="userStore.subscription.type === 'ULTIMATE'">
                高级订阅
              </span>

              <span v-if="userStore.subscription" mx-1 text-3 op-75>
                至{{ dayjs(userStore.subscription.expiredAt).format('YYYY/MM/DD') }}
              </span>
              <span v-else mx-1 text-3 op-75>
                <el-link href="/plan" target="_blank">立即订阅</el-link>
              </span>
            </p>
          </div>
          <div v-wave class="box-data" @click="openHistoryPage">
            <div class="title">
              <p>登录历史</p>
              <div i-carbon-data-table />
            </div>

            <p>
              <span font-bold underline>{{ historyList?.items.length || 0 }}</span> 条记录
            </p>
          </div>
        </div>
      </div>

      <div class="ProfileAccount-Box-Footer">
        <el-button v-wave type="primary" @click="openConfigurePage">
          <div i-carbon-settings />&nbsp;&nbsp;配置
        </el-button>
        <el-button v-wave type="danger" @click="handleLogout">
          <div i-carbon-exit />&nbsp;&nbsp;登出
        </el-button>
      </div>
    </div>

    <div style="--d: 0.2s" class="ProfileAccount-Box">
      <div class="ProfileAccount-Box-Header template-normal">
        <div class="image">
          <div i-carbon-moon />
        </div>
        <div flex class="title">
          外观配置
        </div>
        <p class="subtitle">
          您的个性化配置，在不同设备间同步。
        </p>
      </div>

      <div class="ProfileAccount-Box-Main">
        <ChorePersonalProfileAccountModuleAppearance />
      </div>
    </div>

    <div style="--d: 0.3s" class="ProfileAccount-Box">
      <div class="ProfileAccount-Box-Header template-normal">
        <div class="image">
          <div i-carbon:link />
        </div>
        <div flex class="title">
          QuotaWish 相关账号管理
        </div>
        <p class="subtitle">
          您的第三方相关账号绑定信息等
        </p>
      </div>

      <div class="ProfileAccount-Box-Main">
        <AccountModuleLink />
      </div>

      <div class="ProfileAccount-Box-Footer">
        <el-button v-wave type="primary">
          <div i-carbon-document-attachment />&nbsp;&nbsp;管理
        </el-button>
      </div>
    </div>

    <div style="--d: 0.4s" class="ProfileAccount-Box">
      <div class="ProfileAccount-Box-Header template-normal">
        <div class="image">
          <div i-carbon-share />
        </div>
        <div flex class="title">
          分享管理
        </div>
        <p class="subtitle">
          查看。管理您的历史对话分享记录
        </p>
      </div>

      <div style="max-height: 500px" class="ProfileAccount-Box-Main">
        <div v-if="shareList?.items.length" class="Share">
          <el-scrollbar>
            <div v-for="share in shareList?.items" :key="share.id" class="Share-Item">
              <p class="title">
                {{ share.topic }}
              </p>

              <div class="fixed-right">
                <div v-wave class="icon" @click="handleShareMenu">
                  <div i-carbon-overflow-menu-horizontal />
                </div>
                <div v-wave class="icon" @click="handleShareMenu">
                  <div i-carbon-close />
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <template v-else>
          <el-empty description="暂无任何分享记录" />
        </template>
      </div>
    </div>

    <div style="--d: 0.5s" class="ProfileAccount-Box">
      <div class="ProfileAccount-Box-Header template-normal">
        <div class="image">
          <div i-carbon-code />
        </div>
        <div flex class="title">
          开发者设置
        </div>
        <p class="subtitle">
          您的全局账号API设置等
        </p>
      </div>

      <div class="ProfileAccount-Box-Main">
        <AccountModuleDeveloper />
      </div>
    </div>

    <br>

    <DialogTouchDialog v-model="dialogOptions.visible" :loading="dialogOptions.loading">
      <template #Main>
        <component :is="dialogOptions.component" v-if="dialogOptions.component" :data="dialogOptions.data" />
      </template>
    </DialogTouchDialog>
  </div>
</template>

<style lang="scss">
.Share-Item {
  .fixed-right {
    .icon {
      &:hover {
        background-color: #ffffff30;
      }
      display: flex;

      align-items: center;
      justify-content: center;

      width: 32px;
      height: 32px;

      font-size: 20px;
      border-radius: 8px;
      &:last-child {
        color: var(--el-color-danger);
      }
    }

    display: flex;

    height: 100%;

    gap: 0.5rem;
    align-items: center;
  }
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  display: flex;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;

  width: 100%;

  cursor: pointer;

  align-items: center;
  justify-content: space-between;

  border-radius: 12px;
  background-color: var(--el-fill-color-lighter);
}

.ProfileAccount {
  position: relative;
  padding: 1rem 0;

  width: 100%;
  height: 100%;
}
</style>
