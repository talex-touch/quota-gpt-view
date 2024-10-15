<script setup lang="ts">
import PlanCard from '~/components/card/PlanCard.vue'
import { getOrderList } from '~/composables/api/account'
import { price } from '~/constants/price'

const drawerVisible = ref(false)
const plans = computed(() => price.map((item, index) => ({
  ...item,
  price: {
    discount: item.price.discounted / item.price.origin,
    saved: item.price.origin - item.price.discounted,
    ...item.price,
  },
  got: !index,
})))

function toCheckout(plan: any) {
  // router.push({
  //   path: '/buy',
  //   query: {
  //     type: 'SUBSCRIPTION',
  //     plan: plan.value,
  //     time: 'MONTH',
  //   },
  // })

  // window.open(`${window.origin}/buy?type=SUBSCRIPTION&plan=${plan.value}&time=MONTH`, '_blank')
  window.open(`${window.origin}/plan`, '_blank')
  // router.push(`/buy?type=SUBSCRIPTION&plan=${plan.value}&time=MONTH`)
}

const orderList = ref<any[]>([])

async function fetchData() {
  const res = await getOrderList()

  orderList.value = res.data
}

onMounted(fetchData)

function tableRowClassName({ row, rowIndex }: any) {
  if (row.status === 1)
    return 'success-row'

  else if (row.status === 0)
    return 'warning-row'
  else if (row.status === 3)
    return 'error-row'

  return ''
}
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p class="title-theme">
        订阅计划
      </p>
      <el-link type="primary" @click="drawerVisible = true">
        我的优惠券
      </el-link>
    </div>

    <div class="ProfileWrapper-Main">
      <div v-if="!userStore.subscription?.type" class="PlanWrapper-MainWrapper">
        <!-- <el-alert title="现在下单，新人用户享受限时 2.99/月 福利。" type="success" close-text="更多福利" /> -->
        <el-alert title="价格以结算页面最终价格为准。" type="warning" close-text="了解" />

        <br>

        <h1>简单，透明，高性价比计划</h1>
        <p>立即开始提升你的办公效率、生活体验</p>

        <div class="PlanWrapper-MainWrapper-Plan">
          <PlanCard
            v-for="plan in plans" :key="plan.name" :got="plan.got" :type="plan.type" :desc="plan.desc"
            :name="plan.name" :price="plan.price" @click="toCheckout(plan)"
          >
            <li v-for="feature in plan.features" :key="feature">
              {{ feature }}
            </li>
          </PlanCard>
        </div>
        <br>
      </div>
      <div v-else class="PlanWrapper-List">
        <!-- el-table -->
        <el-table :row-class-name="tableRowClassName" size="small" :data="orderList">
          <el-table-column label="订单号" prop="id" />
          <el-table-column label="订单名" prop="description" />
          <el-table-column label="订单内容">
            <template #default="{ row }">
              {{ row.items.length }}项
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <span v-if="row.status === 0">待支付</span>
              <span v-if="row.status === 1">已完成</span>
              <span v-if="row.status === 2">已取消</span>
              <span v-if="row.status === 3">超时未支付</span>
              <span v-if="row.status === 4">待退款</span>
              <span v-if="row.status === 5">已退款</span>
              <span v-if="row.status === 6">审核中</span>
            </template>
          </el-table-column>
          <el-table-column label="价格">
            <template #default="{ row }">
              ￥{{ row.totalAmount / 100 }}
            </template>
          </el-table-column>
          <el-table-column label="支付方式">
            <template #default="{ row }">
              <span v-if="row.paymentMethod === 1">-</span>
              <span v-if="row.paymentMethod === 2">微信支付</span>
              <span v-if="row.paymentMethod === 3">*</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-drawer v-model="drawerVisible">
      <template #title>
        优惠券列表
      </template>
      <LazyChorePersonalAddonCoupons />
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.PlanWrapper-List {
  display: flex;

  flex-direction: column;

  gap: 1rem;
}

div.ProfileWrapper-Header {
  display: flex;

  flex-direction: row;

  justify-content: space-between;
  align-items: center;
}

.PlanWrapper-MainWrapper-Plan {
  margin: 1rem 0;
  display: flex;

  gap: 1.25rem;
  // padding: 5rem 0;
}

.PlanWrapper-MainWrapper {
  h1 {
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0.5rem 0;

    opacity: 0.75;
    font-weight: 400;
  }

  // height: 800px;

  text-align: center;
}

.title-theme {
  &::before {
    z-index: -1;
    content: 'SUBSCRIPTION';
    position: absolute;

    opacity: 0.5;

    letter-spacing: 1rem;
    font-size: 1.5rem;

    transform: translate(6.5rem, 0.125rem);
  }
}
</style>
