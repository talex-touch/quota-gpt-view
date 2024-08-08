<script lang="ts" setup>
import dayjs from 'dayjs'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import UserAvatar from '~/components/personal/UserAvatar.vue'

definePageMeta({
  name: 'PromptTemplate管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const formLoading = ref(false)
const prompts = ref({
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
  title: '',
})

function handleReset() {
  formInline.title = ''
}

onMounted(fetchData)

async function fetchData() {
  formLoading.value = true

  const query: Record<string, any> = {
    page: prompts.value.meta.currentPage,
    pageSize: prompts.value.meta.itemsPerPage,
    title: formInline.title,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await chatAdminManager.promptList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200)

      prompts.value = res.data
  }

  formLoading.value = false
}
const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: PromptEntityDto | null
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
})

function handleDialog(data: PromptEntityDto | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {
        id: '',
        email: '',
        username: '',
        nickname: '',
        avatar: '',
        qq: '',
        phone: '',
        status: 1,
        remark: '',
        roles: [],
      }
    : { ...data }) as PromptEntityDto
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<PromptEntityDto>>({
  title: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 5, max: 24, message: '用户名需要在 5-24 位之间', trigger: 'blur' },
  ],
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    // if (dialogOptions.mode !== 'new') {
    //   const res: any = await updateUser(dialogOptions.data!.id!, dialogOptions.data as PromptEntityDto)

    //   if (res.code === 200) {
    //     ElMessage.success('修改成功！')
    //     dialogOptions.visible = false
    //     fetchData()
    //   }
    //   else {
    //     ElMessage.error(res.message ?? '修改失败！')
    //   }
    // }
    // else {
    //   const res: any = await addUser(dialogOptions.data as PromptEntityDto)

    //   if (res.code === 200) {
    //     ElMessage.success('添加成功！')
    //     dialogOptions.visible = false
    //     fetchData()
    //   }
    //   else {
    //     ElMessage.error(res.message ?? '添加失败！')
    //   }
    // }

    dialogOptions.loading = false
  })
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()
}

function handleDeleteUser(id: number, data: PromptEntityDto) {
  // ElMessageBox.confirm(
  //   `你确定要删除用户 ${data.username}(${data.nickname}) #${id} 吗？删除后这个账户永久无法找回。`,
  //   '确认删除',
  //   {
  //     confirmButtonText: '取消',
  //     cancelButtonText: '确定删除',
  //     type: 'error',
  //   },
  // )
  //   .then(() => {
  //     ElMessage({
  //       type: 'success',
  //       message: '已取消删除用户！',
  //     })
  //   })
  //   .catch(async () => {
  //     const res: any = await deleteUser(`${id}`)
  //     if (res.code !== 200) {
  //       ElMessage.error('删除失败！')
  //       return
  //     }

  //     fetchData()

  //     ElNotification({
  //       title: 'Info',
  //       message: `你永久删除了用户 ${data.username}(${data.nickname}) #${id} 及其相关数据！`,
  //       type: 'info',
  //     })
  //   })
}
</script>

<template>
  <el-container class="CmsPrompt">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="标题">
          <el-input v-model="formInline.title" minlength="4" placeholder="搜索模板名称" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建用户
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="prompts?.items" :data="prompts.items" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="date" label="头像" width="80">
            <template #default="scope">
              <UserAvatar :avatar="scope.row.avatar" />
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名(昵称)" width="240">
            <template #default="{ row }">
              {{ row.username }}<span op-50>({{ row.nickname }})</span>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="department" label="部门" width="180">
            <template #default="{ row }">
              <el-tag v-if="row.dept">
                {{ row.dept.name }}
              </el-tag>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="180" />
          <el-table-column prop="role" label="角色" width="180">
            <template #default="{ row }">
              <span v-if="row.roles?.length">
                <el-tag v-for="role in row.roles" :key="role.id"> {{ role.name }}</el-tag>
              </span>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="180">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="180" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row }">
              <el-button plain text size="small" @click="handleDialog(row, 'read')">
                详情
              </el-button>
              <el-button plain text size="small" type="warning" @click="handleDialog(row, 'edit')">
                编辑
              </el-button>
              <el-button plain text size="small" type="danger" @click="handleDeleteUser(row.id, row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="prompts?.meta" v-model:current-page="prompts.meta.currentPage"
          v-model:page-size="prompts.meta.itemsPerPage" float-right my-4 :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="prompts.meta.totalItems" @change="fetchData"
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
          v-if="dialogOptions.data" ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'" style="max-width: 600px"
          :model="dialogOptions.data" :rules="rules" label-width="auto" status-icon
        >
          <!-- <el-form-item label="用户头像" prop="avatar">
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
          <el-form-item label="用户角色" prop="roles">
            <el-select v-model="dialogOptions.data.roleIds" multiple placeholder="请选择角色">
              <el-option v-for="item in roles.items" :key="item.id" :label="item.name" :value="item.id" />
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
            <el-input v-model="dialogOptions.data.remark" placeholder="请输入备注..." type="textarea" />
          </el-form-item> -->
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
.CmsPrompt {
}
</style>
