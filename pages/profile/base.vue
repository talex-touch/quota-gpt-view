<script setup lang="ts">
import type { ComponentSize, FormInstance, FormRules, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getAccountDetail } from '~/composables/api/account'
import { EndNormalUrl } from '~/constants'
import UserUploadAvatar from '~/components/personal/UserUploadAvatar.vue'

definePageMeta({
  layout: 'personal',
})

interface RuleForm {
  nickname: string
  avatar: string
  qq: string
  phone: string
  email: string
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
})

onMounted(() => {
  Object.assign(ruleForm, userStore.value)
})

const rules = reactive<FormRules<RuleForm>>({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 5, max: 16, message: '长度应该在 5-16 之间', trigger: 'blur' },
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
        ElMessage.success('更新成功')
        await getAccountDetail()
      }
    }
    else {
      ElMessage.error('请填写正确的信息')

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
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p>您的个人信息</p>
      <p style="font-size: 14px" op-50>
        最后编辑：{{ lastEditTime }}
      </p>
    </div>

    <div class="ProfileWrapper-Main">
      <el-form
        ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto"
        :size="formSize" status-icon
      >
        <el-form-item label="头像" prop="avatar">
          <UserUploadAvatar v-model="ruleForm.avatar" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="ruleForm.nickname" size="large" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" size="large" />
        </el-form-item>

        <el-form-item label="QQ" prop="qq">
          <el-input v-model="ruleForm.qq" disabled size="large" />
        </el-form-item>
      </el-form>
    </div>

    <div class="ProfileWrapper-Footer">
      <div class="ProfileWrapper-Start">
        更新个人信息可能会有延迟
      </div>

      <el-button size="large" @click="resetForm(ruleFormRef)">
        重置
      </el-button>

      <el-button size="large" type="primary" @click="submitForm(ruleFormRef)">
        更新
      </el-button>
    </div>
  </div>
</template>

<style lang="scss">
.ProfileWrapper-Start {
  position: absolute;

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
</style>
