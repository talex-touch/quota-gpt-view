<script setup lang="ts">
import type { ComponentSize, FormInstance, FormRules, UploadProps } from 'element-plus'
import dayjs from 'dayjs'
import AccountModuleLink from './account/AccountModuleLink.vue'
import AccountModuleDeveloper from './account/AccountModuleDeveloper.vue'

import { getAccountDetail, getHistoryList } from '~/composables/api/account'
import ImageUpload from '~/components/personal/ImageUpload.vue'
import { $event } from '~/composables/events'

interface RuleForm {
  nickname: string
  avatar: string
  qq: string
  phone: string
  email: string
  remark: string
}

const loading = ref(false)
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  nickname: '',
  avatar: '',
  qq: '',
  phone: '',
  email: '',
  remark: '',
})

const historyList = ref()

async function fetchHistoryData() {
  const res: any = await getHistoryList()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  historyList.value = res.data
}

onMounted(() => {
  Object.assign(ruleForm, userStore.value)

  fetchHistoryData()
})

const rules = reactive<FormRules<RuleForm>>({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 24, message: '长度应该在 4-24 之间', trigger: 'blur' },
  ],
  avatar: [
    { required: true, message: '请上传头像', trigger: 'blur' },
  ],
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return

  loading.value = true

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const res: any = await updateAccountDetail({ avatar: ruleForm.avatar, nickname: ruleForm.nickname })
      if (res.code === 200) {
        ElMessage({
          message: `更新成功！`,
          grouping: true,
          type: 'success',
          plain: true,
        })
        await getAccountDetail()
      }
    }
    else {
      ElMessage({
        message: `请填写正确的信息`,
        grouping: true,
        type: 'error',
        plain: true,
      })

      console.error('error submit!', fields)
    }

    loading.value = false
  })
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()

  Object.assign(ruleForm, userStore.value)
}

const lastEditTime = computed(() => dayjs(userStore.value.updatedAt).format('DD MMMM YYYY'))

function handleLogout() {
  $event.emit('USER_LOGOUT_SUCCESS', LogoutType.USER_LOGOUT)
}
</script>

<template>
  <div class="ProfileAccount">
    <div class="ProfileAccount-Box">
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
        <div class="template-normal">
          <div class="image">
            <ImageUpload v-model="ruleForm.avatar" />
          </div>
          <div flex cursor-pointer items-center gap-2 class="title">
            <p v-copy="ruleForm.nickname" hover:underline>
              {{ ruleForm.nickname }}
            </p>
            <div v-if="false" i-carbon:edit op-50 hover:op-75 />
          </div>
          <p class="subtitle">
            {{ ruleForm.remark || '酷酷的人没有签名' }}
          </p>
        </div>

        <div class="ProfileAccount-Box-Data">
          <div v-wave class="box-data">
            <div class="title">
              <p>钱包余额</p>
              <div i-carbon:cloud />
            </div>

            <p>0.00</p>
          </div>
          <div v-wave class="box-data">
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
            </p>
          </div>
          <div v-wave class="box-data">
            <div class="title">
              <p>登录历史</p>
              <div i-carbon-data-table />
            </div>

            <p>
              <span font-bold>{{ historyList?.items.length }}</span> 条记录
            </p>
          </div>
        </div>
      </div>

      <div class="ProfileAccount-Box-Footer">
        <el-button v-wave type="primary" @click="submitForm">
          <div i-carbon-settings />&nbsp;&nbsp;保存
        </el-button>
        <el-button v-wave type="danger" @click="handleLogout">
          <div i-carbon-exit />&nbsp;&nbsp;登出
        </el-button>
      </div>
    </div>

    <div class="ProfileAccount-Box">
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

    <div class="ProfileAccount-Box">
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

    <div v-if="false" class="ProfileWrapper-Header">
      <p>您的个人信息</p>
      <p style="font-size: 14px" op-50>
        最后编辑：{{ lastEditTime }}
      </p>
    </div>

    <div v-if="false" class="ProfileWrapper-Main">
      <el-form
        ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto"
        :size="formSize" status-icon
      >
        <el-form-item label="头像" prop="avatar">
          <ImageUpload v-model="ruleForm.avatar" />
          <!-- <UserUploadAvatar v-model="ruleForm.avatar" /> -->
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="ruleForm.nickname" size="large" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" disabled size="large" />
        </el-form-item>

        <el-form-item label="QQ" prop="qq">
          <el-input v-model="ruleForm.qq" disabled size="large" />
        </el-form-item>
      </el-form>

      <ChorePersonalFortuneCard v-if="false" />
      <ChorePersonalInvitationCard v-if="false" />
    </div>

    <div v-if="false" flex class="ProfileWrapper-Footer">
      <div>
        <el-button size="large" type="primary" @click="submitForm(ruleFormRef)">
          更新
        </el-button>
        <el-button size="large" @click="resetForm(ruleFormRef)">
          重置
        </el-button>
      </div>
      <div class="ProfileWrapper-Start">
        更新个人信息可能会有延迟
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ProfileAccount-Box-Data {
  .box-data {
    &:hover {
      background-color: var(--el-fill-color-lighter);
    }
    .title {
      display: flex;

      align-items: center;
      justify-content: space-between;
      color: var(--el-text-color-secondary);
    }

    > p {
      font-size: 14px;
      margin-top: 1rem;
    }
    padding: 1rem;
    display: flex;

    flex: 1;

    cursor: pointer;
    border-radius: 16px;
    flex-direction: column;
    border: 1px solid var(--el-border-color);
  }
  display: flex;
  margin: 1rem 0;

  gap: 0.5rem;
  justify-content: space-between;
}

.ProfileAccount-Box {
  position: relative;
  margin: 1rem auto;

  width: 720px;
  max-width: 85%;

  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--el-border-color);

  &-Header {
    div.image {
      width: 32px;
      height: 32px;

      border-radius: 18px;
      background-color: var(--el-border-color);
    }

    padding: 0.5rem;

    border-bottom: 1px solid var(--el-border-color);
  }

  &-Main {
    .template-normal {
      div.image {
        width: 64px;
        height: 64px;

        border-radius: 50%;
        background-color: var(--el-border-color);
      }

      div.title {
        font-size: 20px;
      }

      p.subtitle {
        font-size: 14px;
      }
    }

    padding: 0.5rem;
  }

  &-Footer {
    display: flex;
    padding: 0.5rem;

    justify-content: flex-end;
  }
}

.ProfileWrapper-Start {
  position: relative;

  left: 2rem;

  align-items: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-right: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.ProfileAccount {
  position: relative;
  padding: 1rem 0;

  width: 100%;
  height: 100%;
}
</style>
