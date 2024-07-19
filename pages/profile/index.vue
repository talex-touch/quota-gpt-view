<script setup lang="ts">
import type { ComponentSize, FormInstance, FormRules, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAccountDetail } from '~/composables/api/account'
import { EndNormalUrl } from '~/constants'

definePageMeta({
  layout: 'personal',
})

const activeName = ref('account')

interface RuleForm {
  nickname: string
  avatar: string
}

const loading = ref(false)
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  nickname: '',
  avatar: '',
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
      const res = await updateAccountDetail({ avatar: ruleForm.avatar, nickname: ruleForm.nickname })
      const json = await res.json()
      if (json.code === 200) {
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

const avatarUrl = computed(() => `${EndNormalUrl}${ruleForm.avatar}`)

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  _uploadFile,
) => {
  ruleForm.avatar = ruleForm.avatar = response.data.filename
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('头像不得大于 10MB!')
    return false
  }
  return true
}

const headers = {
  Authorization: `Bearer ${userStore.value.token}`,
}
</script>

<template>
  <div class="Profile">
    <el-tabs v-model="activeName" v-loading="loading" class="demo-tabs" tab-position="left">
      <el-tab-pane label="账号信息" name="account">
        <el-form
          ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
          :size="formSize" status-icon
        >
          <el-form-item label="头像" prop="avatar">
            <el-upload
              class="avatar-uploader" :action="`${EndNormalUrl}/api/tools/upload`" :show-file-list="false"
              :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="headers"
            >
              <img v-if="ruleForm.avatar" :src="avatarUrl" class="avatar">
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="ruleForm.nickname" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">
              更新
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="会员计划" name="plan">
        会员计划
      </el-tab-pane>
      <el-tab-pane label="推广拉新" name="invitation">
        推广拉新
      </el-tab-pane>
      <el-tab-pane label="开发者设置" name="developer">
        开发者设置
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss">
.Profile {
  position: absolute;
  margin: 1rem 0;
  display: flex;

  top: 61px;
  left: 25%;

  width: 50%;
  height: calc(100% - 61px - 2rem);
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
