<script lang="ts" setup>
import dayjs from 'dayjs'
import type { FormInstance, FormRules } from 'element-plus'
import { type UserQuery, addUser, deleteUser, getDepartmentList, updateUser } from '~/composables/api/account'
import UserUploadAvatar from '~/components/personal/UserUploadAvatar.vue'

definePageMeta({
  name: '部门管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const formLoading = ref(false)
const depts = ref({
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
})

function handleReset() {
  formInline.user = ''
  formInline.email = ''
  formInline.phone = ''
  formInline.remark = ''
}

onMounted(fetchData)

async function fetchData() {
  formLoading.value = true

  const query: any = {}

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getDepartmentList())
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200)
      depts.value = res.data

    formLoading.value = false
  }
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: Partial<any>
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: {},
  loading: false,
})

function handleDialog(data: Partial<any>, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = mode === 'new'
    ? {

      }
    : { ...data }
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
      const res: any = await updateUser(dialogOptions.data.id!, dialogOptions.data as any)

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
        message: '已取消删除用户！',
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
          <el-button type="success" @click="handleDialog({}, 'new')">
            新建部门
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="depts?.items" :data="depts.items" style="width: 100%">
          <el-table-column label="名字" prop="name" />
          <el-table-column label="优先级" prop="orderNo" />
          <el-table-column label="更新者" prop="updater" />
          <el-table-column label="创建者" prop="creator" />
          <el-table-column label="创建日期" prop="createdAt" />
          <el-table-column label="修改日期" prop="updatedAt" />
        </el-table>

        <el-pagination
          v-if="depts?.meta" v-model:current-page="depts.meta.currentPage"
          v-model:page-size="depts.meta.itemsPerPage" float-right my-4 :page-sizes="[100, 200, 300, 400]"
          layout="total, sizes, prev, pager, next, jumper" :total="depts.meta.totalItems" @change="fetchData"
        />
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
          ref="ruleFormRef" :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
          style="max-width: 600px" :model="dialogOptions.data" :rules="rules" label-width="auto" class="demo-ruleForm"
          status-icon
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
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="dialogOptions.data.nickname" />
          </el-form-item>
          <el-form-item label="用户密码" prop="nickname">
            <el-input v-model="dialogOptions.data.password" :disabled="dialogOptions.mode !== 'new'" type="password" />
          </el-form-item>
          <el-form-item label="用户邮箱" prop="email">
            <el-input v-model="dialogOptions.data.email" />
          </el-form-item>
          <el-form-item label="QQ" prop="qq">
            <el-input v-model="dialogOptions.data.qq" />
          </el-form-item>
          <el-form-item label="用户手机号" prop="phone">
            <el-input v-model="dialogOptions.data.phone" />
          </el-form-item>
          <el-form-item label="用户部门" prop="dept">
            <el-select v-model="dialogOptions.data.dept" disabled placeholder="请选择部门">
              <!-- <el-option v-for="item in depts" :key="item.id" :label="item.name" :value="item.id" /> -->
            </el-select>
          </el-form-item>
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
              重置
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
