<script lang="ts" setup>
import dayjs from 'dayjs'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { type UserQuery, addUser, deleteUser, getDepartmentList, getParamList, getRoleList, getUsers, updateUser } from '~/composables/api/account'
import UserUploadAvatar from '~/components/personal/UserUploadAvatar.vue'

definePageMeta({
  name: '参数配置',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const defaultProps = {
  children: 'children',
  label: 'name',
}

const treeDom = ref()
const treeFilterQuery = ref()
const depts = ref()

const formLoading = ref(false)
const users = ref({
  items: [],
  meta: {
    currentPage: 0,
    perPage: 0,
    total: 0,
    totalPages: 0,
    itemsPerPage: 0,
    totalItems: 0,
  },
})

const formInline = reactive({
  user: '',
  email: '',
  phone: '',
  remark: '',
  deptId: 0,
})

function handleReset() {
  formInline.user = ''
  formInline.email = ''
  formInline.phone = ''
  formInline.remark = ''
  formInline.deptId = 0

  treeDom.value?.setCurrentKey(null)
}

onMounted(fetchData)

const roles = ref()

async function fetchData() {
  formLoading.value = true

  const query: any = {}

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getParamList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200) {
      depts.value = (await getDepartmentList()).data

      users.value = res.data
    }
  }

  formLoading.value = false
}

watch(() => formInline.deptId, () => {
  fetchData()
})

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: any | null
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
})

function handleDialog(data: any | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {

      }
    : { ...data }) as any

  dialogOptions.data.deptId = dialogOptions.data.dept?.id ?? 0
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<any>>({

})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    if (dialogOptions.mode !== 'new') {
      const res: any = await updateUser(dialogOptions.data!.id!, dialogOptions.data as any)

      if (res.code === 200) {
        ElMessage.success('修改成功！')
        dialogOptions.visible = false
        fetchData()
      }
      else {
        ElMessage.error(res.message ?? '修改失败！')
      }
    }
    else {
      const res: any = await addUser(dialogOptions.data as any)

      if (res.code === 200) {
        ElMessage.success('添加成功！')
        dialogOptions.visible = false
        fetchData()
      }
      else {
        ElMessage.error(res.message ?? '添加失败！')
      }
    }

    dialogOptions.loading = false
  })
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()
}

function handleDeleteUser(id: number, data: any) {
  ElMessageBox.confirm(
    `你确定要删除 #${id} 吗？删除后这个账户永久无法找回。`,
    '确认删除',
    {
      confirmButtonText: '取消',
      cancelButtonText: '确定删除',
      type: 'error',
    },
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '已取消删除！',
      })
    })
    .catch(async () => {
      const res: any = await deleteUser(`${id}`)
      if (res.code !== 200) {
        ElMessage.error('删除失败！')
        return
      }

      fetchData()

      ElNotification({
        title: 'Info',
        message: `你永久删除了 #${id} 及其相关数据！`,
        type: 'info',
      })
    })
}

function handleNodeClick(node: any, treeNode: any) {
  if (treeNode.checked) {
    treeDom.value?.setCurrentKey(null)
    formInline.deptId = 0
  }
  else { formInline.deptId = node.id }
}

watch(treeFilterQuery, (val) => {
  nextTick(() => treeDom.value!.filter(val))
}, { immediate: true })

function filterNode(value: string, data: any) {
  if (!value)
    return true

  if (data.id === +value)
    return true

  return data.name.includes(value)
}
</script>

<template>
  <el-container class="CmsUser">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="用户名">
          <el-input v-model="formInline.user" minlength="4" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建参数
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="depts?.items" :data="depts.items" style="width: 100%">
    <el-table-column prop="date" label="Date" width="180" />
    <el-table-column prop="name" label="Name" width="180" />
        </el-table>
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          <span v-if="dialogOptions.mode === 'new'">新建</span>
          <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
          <span v-else-if="dialogOptions.mode === 'read'">查看</span>用户信息<span v-if="dialogOptions.data" mx-4 op-50>#{{
            dialogOptions.data.id }}</span>
        </h4>
      </template>
      <template #default>
        <el-form
          v-if="dialogOptions.data" ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'" style="max-width: 600px"
          :model="dialogOptions.data" :rules="rules" label-width="auto" class="demo-ruleForm" status-icon
        >
          <el-form-item label="用户头像" prop="avatar">
            <UserUploadAvatar
              v-model="dialogOptions.data.avatar"
              :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
            />
          </el-form-item>
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="dialogOptions.data.username" :disabled="dialogOptions.mode !== 'new'" />
          </el-form-item>

            <el-tree-select
              v-model="dialogOptions.data.deptId" :default-expand-all="true" :highlight-current="true"
              node-key="id" :check-on-click-node="true" :props="defaultProps" :data="depts"
              :render-after-expand="false"
            />
          <el-form-item label="用户状态" prop="status">
            <el-radio-group v-model="dialogOptions.data.status">
              <el-radio-button :value="0">
                已禁用
              </el-radio-button>
              <el-radio-button :value="1">
                未禁用
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="用户备注" prop="remark">
            <el-input v-model="dialogOptions.data.remark" type="textarea" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <template v-if="dialogOptions.mode === 'read'">
            <el-button @click="dialogOptions.visible = false">
              关闭
            </el-button>
          </template>
          <template v-else>
            <el-button @click="dialogOptions.visible = false">
              取消
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">
              重置系统监控
            </el-button>
            <el-button :loading="dialogOptions.loading" type="primary" @click="submitForm(ruleFormRef)">
              {{ dialogOptions.mode !== 'new' ? "修改" : "新增" }}
            </el-button>
          </template>
        </div>
      </template>
    </el-drawer>
  </el-container>
</template>

<style lang="scss">
.CmsUser {
}
</style>
