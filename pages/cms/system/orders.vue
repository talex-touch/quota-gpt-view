<script lang="ts" setup>
import { CaretBottom, CaretTop, Warning } from '@element-plus/icons-vue'
import { Static } from 'vue';

definePageMeta({
  name: '订单管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

import { $endApi } from '~/composables/api/base';
import type { IAdminOrder, IAdminOrderQuery } from '~/composables/api/base/v1/cms.type';

const statistics = ref({
  orders: [],
  payStatus: {
    other: 0,
    success: 0,
  },
  price: {
    submit: 0,
    success: 0,
  },
  totalPrice: 0,
})
type TemplateType = IAdminOrder
const $dataApi = $endApi.v1.cms.order


const templateData = genCmsTemplateData<TemplateType, IAdminOrderQuery, null>({
  getDeleteBoxTitle(id) {
    return ` 订单#${id} `;
  },
  getEmptyModel: () => ({
    id: 'string',
    description: 'string',
    status: 0,
    totalAmount: 0,
    paymentMethod: 0,
    additionalInfo: 'string',
    createdAt: 'string',
    updatedAt: 'string'
  }),
  onFetchSuccess: async () => {

    Object.assign(statistics.value, list)

    const _orders = statistics.value.orders.map((item: any) => {
      const additionalInfo = parseAdditionalInfo(item.additionalInfo)
      return {
        ...item,
        additionalInfo
      }

    })
    statistics.value.payStatus.other = 0

    statistics.value.price.success = _orders.reduce((a: any, b: any) => {
      if (b.status === 1) { return a + b.totalAmount }
      else {
        statistics.value.payStatus.other++
        return a

      }
    }, 0) / 100
    statistics.value.price.submit = statistics.value.totalPrice / 100
    console.log("======= statistics.value.price.submit =======\n", statistics.value.price.submit);


  },
  transformSubmitData(originData) {



  },
  handleCrudDialog(data) {
    // data.menuIds = data.menus.map((item: any) => item.id)
  },
  getList: $dataApi.list,
  getDeleteBoxTitles: function (ids: Array<number>): string {
    throw new Error('Function not implemented.');
  }
}, {


})


const { list, listForm, fetchData } = templateData

function StatisticsData() {

}




const formLoading = ref(false)
const orders = ref({
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
}
onMounted(async () => {
  fetchData()

})



// async function fetchData() {
//   formLoading.value = true

//   const query: Record<string, any> = {
//     page: orders.value.meta.currentPage,
//     pageSize: orders.value.meta.itemsPerPage,
//   }

//   // 过滤掉为空的值
//   Object.entries(query).forEach(([key, value]) => {
//     if (!value)
//       delete query[key]
//   })

//   const res: any = (await getAdminOrders(query as IAdminOrderQuery))
//   if (!res) {
//     ElMessage.warning('参数错误，查询失败！')
//   }
//   else {
//     if (res.code === 200) {
//       orders.value = res.data

//       Object.assign(statistics.value, (await getAdminOrderStatistics()).data)

//       const _orders = statistics.value.orders.map((item: any) => {
//         const additionalInfo = parseAdditionalInfo(item.additionalInfo)
//         return {
//           ...item,
//           additionalInfo,
//         }
//       })

//       statistics.value.payStatus.other = 0

//       // 计算支付状态=1的订单总额
//       statistics.value.price.success = _orders.reduce((a: any, b: any) => {
//         if (b.status === 1) { return a + b.totalAmount }

//         else {
//           statistics.value.payStatus.other++

//           return a
//         }
//       }, 0) / 100
//       statistics.value.price.submit = statistics.value.totalPrice / 100
//     }
//   }

//   formLoading.value = false
// }

// watch(() => formInline.deptId, () => {
//   fetchData()
// })

// const dialogOptions = reactive<{
//   visible: boolean
//   mode: 'read'
//   data: any
//   loading: boolean
// }>({
//   visible: false,
//   mode: 'read',
//   data: null,
//   loading: false,
// })

// function handleDialog(data: any, mode: 'read') {
//   dialogOptions.mode = mode
//   dialogOptions.visible = true
//   dialogOptions.data = { ...data }
// }

function parseAdditionalInfo(info: string) {
  return JSON.parse(decodeURIComponent(atob(info)))
}
</script>

<template>
  <TemplateStandardCms identifier="order" :crudController="CurdController.REVIEW | CurdController.UPDATE" :list="list" :template-data="templateData" name="订单">
    <template #IHeade>
      <div class="CmsOrder-Statistics">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="statistic-card">
              <el-statistic :value="`${statistics.price.success}/${statistics.price.submit}`">
                <template #title>
                  <div style="display: inline-flex; align-items: center">
                    总金额比例
                    <el-tooltip effect="dark" content="实际成交金额/订单提交金额" placement="top">
                      <el-icon style="margin-left: 4px" :size="12">
                        <Warning />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-statistic>
              <div class="statistic-footer">
                <div class="footer-item">
                  <span>收入预估</span>
                  <span class="green">
                    {{ (statistics.price.success * 0.95).toFixed(3) }}￥
                    <el-icon>
                      <CaretTop />
                    </el-icon>
                  </span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="statistic-card">
              <el-statistic :value="`${statistics.payStatus.success}/${statistics.payStatus.other}`">
                <template #title>
                  <div style="display: inline-flex; align-items: center">
                    订单支付比例
                    <el-tooltip effect="dark" content="已支付订单/其他状态订单" placement="top">
                      <el-icon style="margin-left: 4px" :size="12">
                        <Warning />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-statistic>
              <div class="statistic-footer">
                <div class="footer-item">
                  <span>支付意愿</span>
                  <span :class="((statistics.payStatus.success) / (statistics.payStatus.other)) > 0 ? 'green' : 'red'">
                    {{ ((statistics.payStatus.success) / (statistics.payStatus.other)) * 100 }}%
                    <el-icon>
                      <CaretTop v-if="((statistics.payStatus.success) / (statistics.payStatus.other)) > 0" />
                      <CaretBottom v-else />
                    </el-icon>
                  </span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </template>
    <template #TableColumn>
      <el-table-column type="index" label="序号" />
      <el-table-column label="订单号">
        <template #default="{ row }">
          #{{ row.id }}
        </template>
      </el-table-column>
      <el-table-column label="订单内容">
        <template #default="{ row }">
          {{ row.description }}
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag v-if="row.status === 0" type="danger">
            未支付/默认状态
          </el-tag>
          <el-tag v-else-if="row.status === 1" type="success">
            已支付
          </el-tag>
          <el-tag v-else-if="row.status === 2" type="warning">
            已取消
          </el-tag>
          <el-tag v-else-if="row.status === 3" type="warning">
            超时未支付
          </el-tag>
          <el-tag v-else-if="row.status === 4" type="info">
            等待退款
          </el-tag>
          <el-tag v-else-if="row.status === 5" type="danger">
            已退款
          </el-tag>
          <el-tag v-else-if="row.status === 6" type="info">
            退款待审核
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总价">
        <template #default="{ row }">
          <el-tag>
            {{ (row.totalAmount / 100).toFixed(2) }}￥
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付方式">
        <template #default="{ row }">
          <span v-if="row.paymentMethod === 1">
            AliPay
          </span>
          <span v-if="row.paymentMethod === 2">
            微信支付
          </span>
          <span v-else>
            余额支付
          </span>
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
    </template>
    <template #CrudForm="{ data }">
      <div class="formItemInline">
        <el-form-item label="订单号">
          {{ data.id }}
        </el-form-item>

        <el-form-item label="订单内容">
          {{ data.description }}
        </el-form-item>

        <el-form-item label="状态">
          <el-tag v-if="data.status === 0" type="danger">
            未支付/默认状态
          </el-tag>
          <el-tag v-else-if="data.status === 1" type="success">
            已支付
          </el-tag>
          <el-tag v-else-if="data.status === 2" type="warning">
            已取消
          </el-tag>
          <el-tag v-else-if="data.status === 3" type="warning">
            超时未支付
          </el-tag>
          <el-tag v-else-if="data.status === 4" type="info">
            等待退款
          </el-tag>
          <el-tag v-else-if="data.status === 5" type="danger">
            已退款
          </el-tag>
          <el-tag v-else-if="data.status === 6" type="info">
            退款待审核
          </el-tag>
        </el-form-item>

        <el-form-item label="总价">
          <el-tag>
            {{ (data.totalAmount / 100).toFixed(2) }}￥
          </el-tag>
        </el-form-item>

        <el-form-item label="支付方式">
          <span v-if="data.paymentMethod === 1">
            AliPay
          </span>
          <span v-if="data.paymentMethod === 2">
            微信支付
          </span>
          <span v-else>
            余额支付
          </span>
        </el-form-item>

        <el-form-item label="创建时间">
          {{ formatDate(data.createdAt) }}
        </el-form-item>

        <el-form-item label="更新时间">
          {{ formatDate(data.updatedAt) }}
        </el-form-item>

        <el-form-item label="附加信息">
          <span v-if="data.additionalInfo">
            {{ parseAdditionalInfo(data.additionalInfo) }}
          </span>
        </el-form-item>
      </div>
    </template>
  </TemplateStandardCms>


  <!-- <el-container class="CmsOrder">
  

    <el-main>
      <el-form v-if="false" :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="订单状态">
          <el-input v-model="formInline.user" minlength="4" placeholder="搜索用户名" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="orders?.items" height="85%" table-layout="auto" :data="orders.items" style="width: 100%">
     
          <el-table-column fixed="right" label="操作">
            <template #default="{ row }">
              <el-button plain text size="small" @click="handleDialog(row, 'read')">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination :disabled="formLoading" v-if="orders?.meta" v-model:current-page="orders.meta.currentPage"
          v-model:page-size="orders.meta.itemsPerPage" float-right my-4 :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="orders.meta.totalItems" @change="fetchData" />
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          查看订单信息<span v-if="dialogOptions.data" mx-4 op-50>#{{
            dialogOptions.data.id }}
          </span>
        </h4>
      </template>
      <template #default>
        <el-watermark :font="{ color: 'rgba(255, 255, 255, .15)' }" :z-index="100" class="watermark"
          :content="[userStore.nickname!, 'ThisAI OrderSystem']">
          <el-form v-if="dialogOptions.data" :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
            style="max-width: 600px" :model="dialogOptions.data" label-width="auto" status-icon>
          
          </el-form>
        </el-watermark>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="dialogOptions.visible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-drawer>
  </el-container> -->
</template>

<style lang="scss">
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-bg-color-page) !important;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 16px;
  background-color: var(--el-bg-color);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.green {
  color: var(--el-color-success);
}

.red {
  color: var(--el-color-error);
}

.CmsOrder {
  display: flex;
  flex-direction: column;

  &-Statistics {
    position: relative;
    margin: 1rem 0;
    padding: 1rem;
    // display: flex;

    // align-items: center;
    // justify-content: space-between;

    width: 100%;
    height: max-content;

    border-radius: 16px;
    // box-shadow: var(--el-box-shadow);
    // background-color: var(--el-bg-color);
  }
}
</style>
