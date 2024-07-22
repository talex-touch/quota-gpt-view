<script lang="ts" setup>
import dayjs from 'dayjs'
import type { FormInstance, FormRules } from 'element-plus'
import { addUser, deleteUser, getRoleList, updateUser } from '~/composables/api/account'
import type { IDocDataQuery, IDocGetQuery } from '~/composables/api/doc'
import { addDoc, getDocList, updateDoc } from '~/composables/api/doc'
import UserAvatar from '~/components/personal/UserAvatar.vue'
import UserUploadAvatar from '~/components/personal/UserUploadAvatar.vue'

definePageMeta({
  name: '文档管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const formLoading = ref(false)
const docs = ref({
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
  value: '',
  meta: '',
  permission: '',
  status: '',
})

function handleReset() {
  formInline.title = ''
  formInline.value = ''
  formInline.meta = ''
  formInline.permission = ''
  formInline.status = ''
}

const roles = ref()

onMounted(fetchData)

async function fetchData() {
  formLoading.value = true

  const query: Record<string, any> = {
    page: docs.value.meta.currentPage,
    pageSize: docs.value.meta.itemsPerPage,
    title: formInline.title,
    status: formInline.status,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getDocList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200) {
      roles.value = (await getRoleList()).data

      docs.value = res.data

      docs.value.items.forEach((item: IDocDataQuery) => {
        if (item.value)
          item.value = JSON.parse(decodeURI(atob(item.value)))

        if (item.meta)
          item.meta = JSON.parse(decodeURI(atob(item.meta)))
      })
    }
  }

  formLoading.value = false
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

interface DocForm extends IDocDataQuery {
  metaOptions: any
}

const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: Partial<DocForm>
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: {},
  loading: false,
})

function handleDialog(data: Partial<DocForm>, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = mode === 'new'
    ? {
        title: '',
        value: '',
        meta: '',
        status: 0,
        permission: '',
      }
    : { ...data }

  if (!dialogOptions.data.metaOptions) {
    if (dialogOptions.data.meta) {
      dialogOptions.data.metaOptions = dialogOptions.data.meta
    }
    else {
      dialogOptions.data.metaOptions = {
        parentDoc: -1,
        password: '',
      }
    }
  }
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<DocForm>>({
  title: [
    { required: true, message: '请输入文档名称', trigger: 'blur' },
    { min: 5, max: 24, message: '文档名需要在 5-24 位之间', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' },
  ],
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    const data = dialogOptions.data

    data.meta = btoa(encodeURI(JSON.stringify(data.metaOptions)))
    data.value = btoa(encodeURI(JSON.stringify(data.value)))

    if (dialogOptions.mode !== 'new') {
      const res: any = await updateDoc(dialogOptions.data.id!, data)

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
      const res: any = await addDoc(data)

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

function handleDeleteUser(id: number, data: DocForm) {
  ElMessageBox.confirm(
    `你确定要删除文档 ${data.title} #${id} 吗？删除后这个文档永久无法找回。`,
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
        message: '已取消删除文档！',
      })
    })
    .catch(async () => {
      // const res: any = await deleteUser(`${id}`)
      // if (res.code !== 200) {
      ElMessage.error('删除失败！')
      //   return
      // }

      fetchData()

      ElNotification({
        title: 'Info',
        message: `你永久删除了文档 ${data.title} #${id} 及其相关数据！`,
        type: 'info',
      })
    })
}
</script>

<template>
  <el-container class="CmsDoc">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="文档标题">
          <el-input v-model="formInline.title" minlength="4" placeholder="搜索文档标题" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="formInline.status" placeholder="搜索文档状态" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog({}, 'new')">
            新建文档
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="docs?.items" table-layout="auto" fit :data="docs.items" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column label="文档名">
            <template #default="{ row }">
              {{ row.title }}
            </template>
          </el-table-column>
          <el-table-column label="正文长度">
            <template #default="{ row }">
              {{ row.value.length }}
            </template>
          </el-table-column>
          <el-table-column label="属性">
            <template #default="{ row }">
              {{ row.meta }}
            </template>
          </el-table-column>
          <el-table-column label="创作者">
            <template #default="{ row }">
              {{ row.user }}
            </template>
          </el-table-column>
          <el-table-column label="权限">
            <template #default="{ row }">
              {{ row.permission }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作">
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
          v-if="docs?.meta" v-model:current-page="docs.meta.currentPage"
          v-model:page-size="docs.meta.itemsPerPage" float-right my-4 :page-sizes="[100, 200, 300, 400]"
          layout="total, sizes, prev, pager, next, jumper" :total="docs.meta.totalItems"
        />
      </ClientOnly>
    </el-main>

    <ClientOnly>
      <teleport to=".CmsTemplate">
        <div class="GuideEditor" :class="{ visible: dialogOptions.visible }">
          <div class="Header">
            <h4>
              <span v-if="dialogOptions.mode === 'new'">新建</span>
              <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
              <span v-else-if="dialogOptions.mode === 'read'">查看</span>文档信息<span
                v-if="dialogOptions.mode !== 'new'"
                mx-4 op-50
              >#{{
                dialogOptions.data.id }}</span>
            </h4>

            <div class="Header-Footer">
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
          </div>

          <div v-if="dialogOptions.data.value !== null && dialogOptions.data.value !== undefined" class="GuideContent">
            <RenderEditor v-if="dialogOptions.mode !== 'read'" v-model="dialogOptions.data.value" />
            <RenderContent v-else readonly style="background: var(--el-bg-color)" :data="dialogOptions.data.value" />
          </div>

          <div class="GuideEditor-Footer">
            <div class="GuideEditor-Func">
              <DarkToggle />
            </div>

            <el-form
              ref="ruleFormRef" :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
              :model="dialogOptions.data" :rules="rules" label-width="auto" class="demo-ruleForm" status-icon inline
            >
              <el-form-item label="文档名称" prop="title">
                <el-input v-model="dialogOptions.data.title" :disabled="dialogOptions.mode !== 'read'" />
              </el-form-item>
              <el-form-item label="文档权限" prop="permission">
                <el-input v-model="dialogOptions.data.permission" :disabled="dialogOptions.mode !== 'read'" />
              </el-form-item>
              <el-form-item v-if="dialogOptions.data.metaOptions" label="文档密码" prop="password">
                <el-input
                  v-model="dialogOptions.data.metaOptions!.password" :disabled="dialogOptions.mode !== 'read'"
                  type="password"
                />
              </el-form-item>
              <el-form-item label="文档状态" prop="status">
                <el-select v-model="dialogOptions.data.status" style="width: 180px" placeholder="请选择状态">
                  <el-option label="启用" value="1" />
                  <el-option label="禁用" value="0" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </teleport>
    </ClientOnly>
  </el-container>
</template>

<style lang="scss">
.CmsDoc {
  .el-table__cell .cell {
    text-align: center;
  }
}

.GuideEditor {
  .Header {
    position: absolute;
    display: flex;

    top: 0;

    width: 100%;
    height: 50px;

    align-items: center;
    justify-content: center;

    font-size: 20px;
    font-weight: 600;

    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color);
  }
  .GuideEditor-Footer {
    .GuideEditor-Func {
      position: absolute;
      margin-top: 0.25rem;

      top: 50%;
      left: 1rem;

      transform: translateY(-50%);
    }

    .el-form-item {
      margin-bottom: 0;
    }
    position: absolute;
    display: flex;

    bottom: 0;

    width: 100%;
    height: 50px;

    align-items: center;
    justify-content: center;

    font-size: 20px;
    font-weight: 600;

    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color);
  }
  .Header-Footer {
    position: absolute;

    right: 1rem;
  }
  .GuideContent {
    .RenderEditor,
    .RenderContent,
    .vditor {
      height: 100% !important;
    }

    .RenderContent {
      padding: 0 1rem;
    }
    position: absolute;

    top: 50px;
    left: 50%;

    width: 1080px;
    height: calc(100% - 100px);

    transform: translateX(-50%);
    border: 1px solid var(--el-border-color);
  }
  z-index: 10;
  position: absolute;
  padding: 0;
  margin: 0;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  overflow: hidden;
  border-radius: 0;
  background-color: var(--el-bg-color-page);

  opacity: 0;
  pointer-events: none;
  transform: scale(1.15);
  transition: 0.25s;

  &.visible {
    opacity: 1;
    pointer-events: all;
    transform: scale(1);
  }
}
</style>
