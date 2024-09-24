<script lang="ts" setup>
import { $endApi } from '~/composables/api/base'
import type { IFeedbackModel, IFeedbackModelQuery, IRoleModel, IRoleModelQuery } from '~/composables/api/base/index.type'
import TemplateStandardCms from '~/components/template/StandardCms.vue'

definePageMeta({
  name: '反馈管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

type TemplateType = IFeedbackModel
const $dataApi = $endApi.v1.cms.feedback

const templateData = genCmsTemplateData<TemplateType, IFeedbackModelQuery, null>(
  {
    getDeleteBoxTitle(id) {
      return ` 反馈管理#${id} `
    },
    getEmptyModel: () => ({
      id: 0,
      user: {},
      allRate: 0,
      feedDesc: '',
      feedType: '',
      feedID: '',
      feedSuggestion: '',
      createdAt: '',
      updatedAt: '',
    }),
    onFetchSuccess: async () => {},

    handleCrudDialog() {
      // data.menuIds = data.menus.map((item: any) => item.id)
    },
    getList: $dataApi.list,
    update: $dataApi.update,
    delete: $dataApi.delete,
    getDeleteBoxTitles(ids: Array<number>): string {
      return ` 反馈管理#${ids.join(',')} `
    },
  },
  {}
)
const { list, listForm, fetchData } = templateData

onMounted(fetchData)

// const rules = reactive<FormRules<TemplateType>>({
//   name: [
//     { required: true, message: '请输入角色名称', trigger: 'blur' },
//     { min: 5, max: 24, message: '角色名称需要在 5-24 位之间', trigger: 'blur' },
//   ],
//   value: [
//     { required: true, message: '请输入角色值', trigger: 'blur' },
//   ],
//   status: [
//     { required: true, message: '请选择状态', trigger: 'blur' },
//   ],
// })
</script>

<template>
  <TemplateStandardCms identifier="role" :list="list" :template-data="templateData" name="反馈">
    <template #QueryForm>
      <!-- <el-form-item label="角色名称">
        <el-input v-model="listForm." placeholder="角色名称" clearable />
      </el-form-item> -->

      <!-- <el-form-item label="状态">
        <el-radio-group v-model="listForm.status">
          <el-radio-button :value="0">
            否
          </el-radio-button>
          <el-radio-button :value="1">
            是
          </el-radio-button>
        </el-radio-group>
      </el-form-item> -->
    </template>
    <template #TableColumn>
      <el-table-column width="100px" type="index" label="序号" />
      <el-table-column prop="" label="反馈人">
        <template #default="{ row }">
          {{ row.user.nickname }}
        </template>
      </el-table-column>

      <el-table-column prop="feedId" label="反馈单号" />

      <!-- <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column prop="allRate" label="整体评价" />
      <el-table-column prop="feedType" label="反馈类型" />
      <el-table-column prop="feedDesc" label="反馈描述" />
      <el-table-column prop="feedSuggestion" label="反馈建议" />

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
    </template>
    <template #CrudForm="{ data }">
      <div class="formItemInline">

        <el-form-item label="反馈人" inline>
          <el-input v-model="data.user.nickname" placeholder="请输入整体评价..." clearable  disabled/>
        </el-form-item>
        <el-form-item label="整体评价" inline>
          <el-input v-model="data.allRate" placeholder="请输入整体评价..." clearable  disabled />
        </el-form-item>

        <el-form-item label="反馈类型" inline>
          <el-input v-model="data.feedType" placeholder="请输入反馈类型..." clearable  />
        </el-form-item>

        <el-form-item label="反馈描述" inline>
          <el-input v-model="data.feedDesc" placeholder="请输入反馈描述..." clearable disabled />
        </el-form-item>

        <el-form-item label="反馈建议" inline>
          <el-input v-model="data.feedSuggestion" placeholder="请输入反馈建议..." clearable disabled />
        </el-form-item>
      </div>
    </template>
  </TemplateStandardCms>
</template>
