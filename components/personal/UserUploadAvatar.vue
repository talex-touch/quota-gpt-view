<script setup lang="ts">
import type { ComponentSize, FormInstance, FormRules, UploadProps } from 'element-plus'
import { EndNormalUrl } from '~/constants'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits(['update:modelValue'])

const avatarForm = useVModel(props, 'modelValue', emits)

const avatarUrl = computed(() => {
  if (props.modelValue.startsWith('http'))
    return props.modelValue

  return `${EndNormalUrl}${avatarForm.value}`
})

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  _uploadFile,
) => {
  avatarForm.value = response.data.filename
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
  <el-upload
    class="avatar-uploader" :action="`${EndNormalUrl}api/tools/upload`" :show-file-list="false"
    :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="headers"
  >
    <img v-if="avatarForm" :src="avatarUrl" class="avatar">
    <el-icon v-else class="avatar-uploader-icon">
      <Plus />
    </el-icon>
  </el-upload>
</template>

<style lang="scss"></style>
