<script setup lang="ts">
import PlanCard from '~/components/card/PlanCard.vue'
import { price } from '~/constants/price'

const router = useRouter()

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
  router.push(`/buy?type=SUBSCRIPTION&plan=${plan.value}&time=MONTH`)
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
      <div class="ProfileWrapper-MainWrapper">
        <!-- <el-alert title="现在下单，新人用户享受限时 2.99/月 福利。" type="success" close-text="更多福利" /> -->
        <el-alert title="价格以结算页面最终价格为准。" type="warning" close-text="了解" />

        <br>

        <h1>简单，透明，高性价比计划</h1>
        <p>立即开始提升你的办公效率、生活体验</p>

        <div class="ProfileWrapper-MainWrapper-Plan">
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
div.ProfileWrapper-Header {
  display: flex;

  flex-direction: row;

  justify-content: space-between;
  align-items: center;
}

.ProfileWrapper-MainWrapper-Plan {
  margin: 1rem 0;
  display: flex;

  gap: 1.25rem;
  // padding: 5rem 0;
}

.ProfileWrapper-MainWrapper {
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
