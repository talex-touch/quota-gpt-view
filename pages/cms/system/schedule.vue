<script lang="ts" setup>
import dayjs from 'dayjs'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { type TaskEntity,  addSchedule, addUser, deleteUser, getScheduleList, updateSchedule, updateUser } from '~/composables/api/account'


definePageMeta({
  name: '任务调度',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})






const formLoading = ref(false)
const schedules = ref({
  items: [] as TaskEntity[],
  meta: {
    currentPage: 0,
    perPage: 0,
    total: 0,
    totalPages: 0,
    itemsPerPage: 0,
    totalItems: 0,
  },
})



const roles = ref()

onMounted(fetchData)

async function fetchData() {
  formLoading.value = true

  const query: any = {
    page: schedules.value.meta.currentPage | 1,
    pageSize: schedules.value.meta.itemsPerPage | 10,
  
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getScheduleList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200) {
      // depts.value = (await getDepartmentList()).data
      // roles.value = (await getRoleList()).data

      schedules.value = res.data
      console.log("======= res.data =======\n", res.data);
      
    }
  }

  formLoading.value = false
}



function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}



const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: Partial<TaskEntity> | null
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
})

function handleDialog(data: Partial<TaskEntity> | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {

      }
    : { ...data }) as TaskEntity

  // dialogOptions.data.roleIds = dialogOptions.data.roles!.map((item: any) => item.id)
  // dialogOptions.data.deptId = dialogOptions.data.dept?.id ?? 0
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<TaskEntity>>({
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    if (dialogOptions.mode !== 'new') {
      const res: any = await updateSchedule(dialogOptions.data!.id!, dialogOptions.data as TaskEntity)

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
      const res: any = await addSchedule(dialogOptions.data as TaskEntity)

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

function handleDeleteSchedule(id: number, data: TaskEntity) {
  ElMessageBox.confirm(
    `你确定要删除#${id} 吗？删除后这个账户永久无法找回。`,
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
        message: `你永久删除了#${id} 及其相关数据！`,
        type: 'info',
      })
    })
}


</script>

<template>
  <el-container class="CmsUser">
    <el-main>
      <el-form :disabled="formLoading" :inline="true">
        <el-form-item style="margin-right: 0;" float-right>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建任务调度
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="schedules?.items" :data="schedules.items as[]" style="width: 100%;">
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="service" label="服务路径" />
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="type" label="种类" />

          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="limit" label="执行次数" />
          <el-table-column prop="cron" label="定时" />
          <el-table-column prop="every" label="every" />
          <el-table-column prop="data" label="数据" />
          <el-table-column prop="jobOpts" label="jobOpts" />

          <el-table-column prop="remark" label="备注" />

          <el-table-column prop="startTime" label="开始时间" >
            <template #default="scope">
              {{ formatDate(scope.row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" >
            <template #default = "scope">
              {{ formatDate(scope.row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" >
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更改时间" >
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
              <el-button plain text size="small" type="danger" @click="handleDeleteSchedule(row.id,row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="schedules?.meta"
          v-model:current-page="schedules.meta.currentPage"
          v-model:page-size="schedules.meta.itemsPerPage"
          float-right
          my-4
          :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="schedules.meta.totalItems"
          @change="fetchData"
        />
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          <span v-if="dialogOptions.mode === 'new'">新建</span>
          <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
          <span v-else-if="dialogOptions.mode === 'read'">查看</span>用户信息<span v-if="dialogOptions.data" mx-4 op-50>#{{ dialogOptions.data.id }}</span>
        </h4>
      </template>
      <template #default>
        <el-form
          v-if="dialogOptions.data"
          ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
          style="max-width: 600px;"
          :model="dialogOptions.data"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
          status-icon
        >
          <el-form-column prop="name" label="任务名称">
            <el-input v-model="dialogOptions.data.name" placeholder="任务名称" clearable />
          </el-form-column>
          <el-form-column prop="service" label="服务路径">
            <el-input v-model="dialogOptions.data.service" placeholder="服务路径" clearable />
          </el-form-column>

          <el-form-column prop="type" label="种类">
            <!-- <el-select v-model="dialogOptions.data.type" placeholder="种类">
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select> -->
          </el-form-column>

          <el-form-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-form-column>

          <el-form-column prop="limit" label="执行次数">
            <el-input v-model="dialogOptions.data.limit" placeholder="执行次数" clearable />
          </el-form-column>
          <el-form-column prop="cron" label="定时">
            <el-input v-model="dialogOptions.data.cron" placeholder="请输入Cron表达式" clearable />
          </el-form-column>
          <el-form-column prop="every" label="every">
            <el-input v-model="dialogOptions.data.every" placeholder="every" clearable />
          </el-form-column>
          <el-form-column prop="data" label="data">
            <el-input v-model="dialogOptions.data.data" placeholder="data" clearable />
          </el-form-column>
          <el-form-column prop="jobOpts" label="jobOpts">
            <el-input v-model="dialogOptions.data.jobOpts" placeholder="jobOpts" clearable />
          </el-form-column>

          <el-form-column prop="remark" label="备注">
            <el-input v-model="dialogOptions.data.remark" placeholder="备注" clearable />
          </el-form-column>

          <el-form-column prop="startTime" label="开始时间" />
          <el-form-column prop="endTime" label="结束时间" />
          <el-form-column prop="createdAt" label="创建时间" />
          <el-form-column prop="updatedAt" label="更改时间" />

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
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto;">
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
              重置任务调度
            </el-button>
            <el-button :loading="dialogOptions.loading" type="primary" @click="submitForm(ruleFormRef)">
              {{ dialogOptions.mode !== 'new' ? '修改' : '新增' }}
            </el-button>
          </template>
        </div>
      </template>
    </el-drawer>
  </el-container>
</template>

<style lang="scss"></style>
