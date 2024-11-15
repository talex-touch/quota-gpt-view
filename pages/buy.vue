<script setup lang="ts">
import WechatPay from '/svg/wechat-pay.svg'
import AliPay from '/svg/ali-pay.svg'
import Balance from '/svg/balance.svg'

import ThCheckBox from '~/components/checkbox/ThCheckBox.vue'
import ShiningButton from '~/components/button/ShiningButton.vue'
import TextShaving from '~/components/other/TextShaving.vue'
import BuyDialog from '~/components/chore/buy/BuyDialog.vue'

import Logo from '~/components/chore/Logo.vue'
import JSConfetti from 'js-confetti'
import { SUBSCRIPTION_PLAN_LIST } from '~/composables/subscription'
import { getOrderPlanPrice, getOrderStatus, getUserNearestUnPayOrder, orderPlanPrice } from '~/composables/api/account'
import { $endApi } from '~/composables/api/base'
import { createTapTip } from '~/composables/tip'

const route = useRoute()
const router = useRouter()

const subscriptionMode = computed(() => route.query?.type === 'SUBSCRIPTION')
const dummyMode = computed(() => route.query?.type === 'DUMMY')

function buyEffect() {
  const confetti = new JSConfetti()

  confetti.addConfetti({
    emojis: ['🎉', '🎊', '🎈', '🎁', '🎉', '🎊', '🎈', '🎁'],
    confettiNumber: 100,
  })
}

definePageMeta({
  layout: 'default',
})

const dialog = useTypedRef(BuyDialog)
const orderDetail = reactive<any>({
  id: '',
  loading: false,
  info: null,
  res: null,
})

const plans = reactive([...SUBSCRIPTION_PLAN_LIST])

const payOptions = reactive({
  now: -1,
  type: 'STANDARD',
  time: 'MONTH',
  dialog: false,
  agreement: true,
  price: 0,
  dummyValue: 0,
  code: '',
  unavailable: false,
  countdown: {
    created: 0,
    upto: 0,
  },
  success: false,
})

function parseDataInfo(data: any) {
  orderDetail.info = data

  payOptions.price = data.meta.feeTax
}

function selectPlan(_plan?: any) {
  if (_plan) {
    payOptions.type = _plan.type
    payOptions.time = _plan.time
  }

  // get plan
  const plan = plans.find(plan => plan.type === payOptions.type && plan.time === payOptions.time)
  if (!plan)
    return // impossible

  // 后面的 scope 是监测不到变化的，放心用REFLECT

  setTimeout(async () => {
    orderDetail.loading = true

    // fetch data
    const res = await getOrderPlanPrice(payOptions.type as any, payOptions.time, payOptions.code)

    orderDetail.loading = false

    if (!res.data) {
      payOptions.unavailable = true

      ElMessage({
        message: res.message || '出现未知错误！',
        grouping: true,
        type: 'error',
        plain: true,
      })

      return
    }

    payOptions.unavailable = false

    const { data } = res

    parseDataInfo(data)

    router.push({
      query: {
        ...route.query,
        plan: payOptions.type,
        time: payOptions.time,
      },
    })
  })
}

function selectDummy(value: number) {
  payOptions.dummyValue = value

  setTimeout(async () => {
    orderDetail.loading = true

    // fetch data
    const res = await $endApi.v1.account.getOrderDummyPrice(value, payOptions.code)

    orderDetail.loading = false

    if (!res.data) {
      payOptions.unavailable = true

      ElMessage({
        message: res.message || '出现未知错误！',
        grouping: true,
        type: 'error',
        plain: true,
      })

      return
    }

    payOptions.unavailable = false

    const { data } = res

    parseDataInfo(data)
  })
}

let func: any

function timer() {
  if (payOptions.success)
    return

  payOptions.now = Date.now()

  func?.()

  // setTimeout(timer, 100)
  requestAnimationFrame(timer)
}

function parseGood() {
  if (subscriptionMode.value && route.query?.plan && route.query?.time) {
    const plan = plans.find(plan => plan.type === route.query?.plan && plan.time === route.query?.time)
    if (plan)
      selectPlan(plan)
  }
  else if (dummyMode.value && route.query.value) {
    selectDummy(+route.query.value || 0)
  }
}

onMounted(async () => {
  const unpayRes = await getUserNearestUnPayOrder()

  if (unpayRes.data) {
    const { id, additionalInfo } = unpayRes.data.order
    const info = decodeObject(additionalInfo)

    orderDetail.id = id

    parseDataInfo(info.meta.subscription || info.meta.dummy)

    orderDetail.res = unpayRes
    dialog.value?.openBuyDialog(unpayRes)
  }
  else if (route.query?.orderId) {
    setTimeout(async () => {
      const res = await getOrderStatus(route.query?.orderId as string)
      if (!res.data) {
        ElMessage({
          message: '订单不存在！',
          grouping: true,
          type: 'error',
          plain: true,
        })
        router.back()
        return
      }

      const { data } = res

      const info = data.additionalInfo ? JSON.parse(`${decodeURIComponent(atob(data.additionalInfo))}`) : {}

      if (!info) {
        ElMessage({
          message: '获取订单信息异常！',
          grouping: true,
          type: 'error',
          plain: true,
        })
        return
      }

      orderDetail.id = data.id

      const startTime = new Date(data.createdAt).getTime()

      payOptions.countdown = {
        created: startTime,
        upto: startTime + 60 * 1000 * 5,
      }

      parseDataInfo(info.meta.subscription || info.meta.dummy)

      if (data.status !== 1)
        return

      payOptions.success = true

      buyEffect()
    })
  }

  else {
    parseGood()
  }

  timer()
})

async function submit() {
  if (payOptions.unavailable)
    return

  if (
    orderDetail.loading)
    return

  if (orderDetail.res) {
    dialog.value?.openBuyDialog(orderDetail.res)

    return
  }

  orderDetail.loading = true

  const tipTap = createTapTip()

  tipTap.setMessage('正在准备创建订单').setLoading(true).show()

  if (subscriptionMode.value) {
    const res = await orderPlanPrice(payOptions.type as any, payOptions.time, payOptions.code)

    orderDetail.res = res
    dialog.value?.openBuyDialog(res)
  }
  else if (dummyMode.value) {
    const res = await $endApi.v1.account.dummyOrder(payOptions.dummyValue, payOptions.code)

    orderDetail.res = res
    dialog.value?.openBuyDialog(res)
  }

  tipTap.setMessage('订单创建成功').setLoading(false)

  orderDetail.loading = false
}

const countdownObj = computed(() => {
  if (!payOptions.countdown.created)
    return null

  const { created, upto } = payOptions.countdown

  const now = payOptions.now

  const left = upto - now

  return {
    expired: upto < payOptions.now,
    left,
    created,
    upto,
    now,
    uptoText: formatDate(upto, 'YYYY/MM/DD HH:mm:ss'),
  }
})

async function paySuccess(data: any) {
  if (data.status !== 1) {
    ElMessage({
      message: '支付失败，请联系管理员！',
      grouping: true,
      type: 'error',
      plain: true,
    })

    location.reload()
    return
  }

  payOptions.dialog = false
  payOptions.success = true

  // buyEffect()

  ElMessage({
    message: '支付成功！',
    grouping: true,
    type: 'success',
    plain: true,
  })

  setTimeout(() => location.reload(), 1200)
}

function handleOrderEstablished(data: any) {
  orderDetail.id = data.order.id
  const createdAt = new Date(data.order.createdAt)
  payOptions.countdown = {
    created: createdAt.getTime(),
    upto: createdAt.getTime() + 5 * 60 * 1000,
  }

  // 更新总价
  payOptions.price = data.order.totalAmount

  router.push({
    path: '/buy',
    query: {
      orderId: orderDetail.id,
    },
  })

  let ts = -1
  func = async () => {
    const diff = Date.now() - ts
    if (diff <= 1200)
      return

    ts = Date.now()

    const status = await getOrderStatus(data.order.id)

    if (status.data.status !== 0) {
      func = null

      paySuccess(status.data)
    }
  }
}

watch(() => payOptions.code, parseGood)

function calcExpired(date: number) {
  return date + 4 * 60 * 60 * 1000
}

const payments = reactive<any>({
  select: 'wechat',
  children: [
    {
      svg: WechatPay,
      value: 'wechat',
      name: '微信支付',
      disabled: () => countdownObj.value?.expired || payOptions.success,
    },
    {
      svg: AliPay,
      value: 'alipay',
      name: '支付宝支付',
      disabled: () => countdownObj.value?.expired || payOptions.success,
    },
    {
      svg: Balance,
      value: 'balance',
      name: '余额支付',
      available: () => !dummyMode.value,
      disabled: () => countdownObj.value?.expired || payOptions.success,
    },
  ],
})

const mobileNavVisible = ref(false)
const paymentMethods = computed(() => payments.children.filter((item: any) => item.available?.() ?? true))
</script>

<template>
  <div class="CheckoutPage">
    <div class="CheckoutPage-Header">
      <el-page-header title="返回" @back="router.push('/?data=plan')">
        <template #content>
          <span class="text-large mr-3 font-600">
            <span v-if="orderDetail.id">订单详情</span>
            <span v-else-if="subscriptionMode">选择订阅</span>
            <span v-else-if="dummyMode">充值余额</span>
            <span v-else>支付</span>
          </span>
        </template>
      </el-page-header>
    </div>

    <div class="CheckoutPage-MainContainer">
      <el-scrollbar>
        <div class="CheckoutPage-Main">
          <p class="CheckoutPage-HeadTitle">
            结账
            <span v-if="payOptions?.success" style="font-size: 18px;font-weight: normal;opacity: 0.65">您已成功完成支付，
              订单到账可能会有一定延迟。
            </span>
            <span
              v-else-if="subscriptionMode"
              style="font-size: 18px;font-weight: normal;opacity: 0.65"
            >现在选择适合你的订阅，邀请用户可得返现哦。</span>
            <span
              v-else
              style="font-size: 18px;font-weight: normal;opacity: 0.65"
            >平台倡导量入为出，请理性消费。未成年人下单前必须由监护人同意。</span>
          </p>

          <div class="CheckoutPage-Content">
            <div class="CheckoutPage-ContentInner">
              <OtherWarnAlert
                v-if="!payOptions.success && countdownObj?.expired" icon="i-carbon:information"
                title="订单超时"
              >
                订单已关闭
              </OtherWarnAlert>
              <OtherWarnAlert
                v-else-if="!payOptions.success && orderDetail.id && countdownObj"
                icon="i-carbon:information" title="您的订单将被保留"
              >
                我们将您的订单保留至 {{ countdownObj.uptoText }}。你可以随时继续支付这个订单。
              </OtherWarnAlert>

              <div v-if="subscriptionMode && !orderDetail.id" class="CheckoutPage-Content-Info Options">
                <p>选择订阅</p>
                <ul>
                  <li
                    v-for="plan in plans" :key="plan.name"
                    :class="{ trial: plan.trial, active: payOptions.time === plan.time && payOptions.type === plan.type }"
                    @click="selectPlan(plan)"
                  >
                    {{ plan.name }}
                  </li>
                </ul>
              </div>
              <div v-if="!payOptions.unavailable" class="CheckoutPage-Content-Info">
                <div class="title">
                  订单详情<span v-if="orderDetail.id" class="only-pc-display">#{{ orderDetail.id }}</span>

                  <div v-if="payOptions.success" class="pay-stamp">
                    <TextShaving text="已支付" />
                  </div>
                </div>
                <ul v-if="orderDetail.info" v-loading="orderDetail.loading">
                  <li v-for="line in orderDetail.info.info" :key="line.name" :class="{ free: line.free }">
                    <span>{{ line.name }}</span>
                    <span v-if="!line.free">{{ (line.price / 100).toFixed(2) }}￥</span>
                    <span v-else>附赠</span>
                  </li>
                </ul>
              </div>
              <ChoreBuyPaymentsCard
                v-model="payments.select" :methods="paymentMethods"
                :disabled="payOptions.unavailable" :loading="orderDetail.loading" class="CheckoutPage-Content-Info"
              />
              <ChoreBuyQuestionares class="only-pe-display" />
              <div class="CheckoutPage-Content-Info only-pc-display">
                <OtherDefaultAlert icon="i-carbon:manage-protection" title="随时取消政策">
                  在科塔锐行，我们深知计划可能随时发生变化。为此，我们特别设计了一套取消政策，旨在为您带来最大的灵活性与安心保障。当您选择我们时，您将享有充分的自由度来调整或取消预订，无需担心任何取消费用。我们的政策允许您在购买后<span
                    font-bold
                  >3 小时</span>内免费修改订单，确保您的计划能够灵活适应各种突发状况。<el-link
                    target="_blank"
                    :href="getProtocolUrl('plan_change')" type="primary"
                  >
                    了解更多
                  </el-link>
                </OtherDefaultAlert>
              </div>
            </div>
            <div class="CheckoutPage-Aside only-pc-display">
              <!-- && !payOptions.unavailable -->
              <div
                v-if="!payOptions?.success && !countdownObj?.expired" v-loading="orderDetail.loading"
                class="CheckoutPage-Content-Info"
              >
                <p>优惠券码</p>
                <ChoreCouponSelector v-model="payOptions.code" placeholder="可选" />
              </div>
              <div v-if="!payOptions.unavailable" v-loading="orderDetail.loading" class="CheckoutPage-Content-Info">
                <ul v-if="orderDetail.info?.meta">
                  <p>概述信息</p>
                  <li>
                    <span op-75>订单信息</span>
                    <span>{{ orderDetail.info.name }}</span>
                  </li>
                  <li v-if="orderDetail.info.meta?.range">
                    <span op-75>有效期限</span>
                    <span>{{ orderDetail.info.meta.range }}</span>
                  </li>
                  <li v-if="!payOptions.unavailable">
                    <span op-75>购买时间</span>
                    <span>{{ formatDate(payOptions.countdown.created || payOptions.now) }}</span>
                  </li>
                  <li v-if="!payOptions.unavailable">
                    <span op-75>取消截至</span>
                    <span>{{ formatDate(calcExpired(payOptions.countdown.created || payOptions.now)) }}</span>
                  </li>
                </ul>
                <ul v-if="orderDetail.info?.meta">
                  <p>支付信息</p>
                  <li>
                    <span op-75>标准费率</span>
                    <span>{{ (orderDetail.info.meta.originPrice / 100).toFixed(2) }}￥</span>
                  </li>
                  <li :class="{ discount: orderDetail.info.meta.originPrice > orderDetail.info.meta.fee }">
                    <span op-75>优惠价格</span>
                    <span>-{{ ((orderDetail.info.meta.originPrice - orderDetail.info.meta.fee) / 100).toFixed(2)
                    }}￥</span>
                  </li>
                  <li v-if="orderDetail.info.meta.average">
                    <span op-75>平均费率</span>
                    <span>{{ (orderDetail.info.meta.average / 100).toFixed(2) }}/天 ￥</span>
                  </li>
                  <li>
                    <span op-75>标准税费</span>
                    <span>+{{ ((orderDetail.info.meta.tax / 100).toFixed(2)) }} ￥</span>
                  </li>
                </ul>
                <ul class="line">
                  <p>账单总计</p>
                  <span>{{ ((orderDetail.info?.meta?.feeTax ?? 0) / 100).toFixed(2) }}￥</span>
                </ul>
              </div>

              <div
                v-if="payOptions?.success" v-loading="orderDetail.loading" flex items-center
                class="CheckoutPage-Content-Info Confirm"
              >
                <div flex items-center>
                  <ThCheckBox v-model="payOptions.agreement" disabled />&nbsp;<el-text>
                    购买即代表您已阅读同意<el-link target="_blank" :href="getProtocolUrl('subscription_service')">
                      《使用服务协议》
                    </el-link> 和<el-link target="_blank" :href="getProtocolUrl('refund_relatives')">
                      《订单退款协议》
                    </el-link>
                  </el-text>
                </div>
                <ShiningButton :class="{ shrink: !payOptions.agreement }">
                  售后咨询
                </ShiningButton>
              </div>
              <div
                v-else-if="!countdownObj?.expired && !payOptions.unavailable" v-loading="orderDetail.loading"
                class="CheckoutPage-Content-Info Confirm"
              >
                <div flex items-center>
                  <ThCheckBox v-model="payOptions.agreement" />&nbsp;<el-text>
                    购买即代表您已阅读同意<el-link target="_blank" :href="getProtocolUrl('subscription_service')">
                      《使用服务协议》
                    </el-link> 和<el-link target="_blank" :href="getProtocolUrl('thisai_privacy')">
                      《用户隐私协议》
                    </el-link>
                  </el-text>
                </div>
                <ShiningButton :class="{ shrink: !payOptions.agreement }" @click="submit">
                  {{ orderDetail.id ? '继续支付' : '确认支付' }}
                </ShiningButton>
              </div>
              <div
                v-else-if="countdownObj?.expired" v-loading="orderDetail.loading" flex items-center
                class="CheckoutPage-Content-Info Confirm"
              >
                <TextShaving style="width: max-content" text="订单已失效" />
              </div>
              <div v-else v-loading="orderDetail.loading" flex items-center class="CheckoutPage-Content-Info Confirm">
                <TextShaving style="width: max-content" text="当前计划不可用" />
              </div>
            </div>
          </div>

          <div v-loading="orderDetail.loading" class="CheckoutPage-MobileNav only-pe-display">
            <template v-if="payOptions?.success">
              <div flex items-center>
                <ThCheckBox v-model="payOptions.agreement" disabled />&nbsp;<el-text>
                  购买即代表您已阅读同意<el-link target="_blank" :href="getProtocolUrl('subscription_service')">
                    《使用服务协议》
                  </el-link> 和<el-link target="_blank" :href="getProtocolUrl('refund_relatives')">
                    《订单退款协议》
                  </el-link>
                </el-text>
              </div>
              <ShiningButton style="width: 100%;" :class="{ shrink: !payOptions.agreement }">
                售后咨询
              </ShiningButton>
            </template>
            <template v-else>
              <div flex items-center>
                <ThCheckBox v-model="payOptions.agreement" disabled />&nbsp;<el-text>
                  购买即代表您已阅读同意<el-link target="_blank" :href="getProtocolUrl('subscription_service')">
                    《使用服务协议》
                  </el-link> 和<el-link target="_blank" :href="getProtocolUrl('refund_relatives')">
                    《订单退款协议》
                  </el-link>
                </el-text>
              </div>
              <ShiningButton style="width: 100%;" flex-shrink-0 @click="mobileNavVisible = true">
                确认协议并立即支付{{ ((orderDetail.info?.meta?.feeTax ?? 0) / 100).toFixed(2) }}元
              </ShiningButton>
            </template>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div
      :class="{ visible: mobileNavVisible }" class="transition-cubic MobileAside only-pe-display"
      @click="mobileNavVisible = false"
    >
      <div class="CheckoutPage-Aside transition-cubic" @click="mobileNavVisible = true">
        <div class="slider" @click="mobileNavVisible = false" />

        <div class="MobileAside-InnerMain" @click.stop="mobileNavVisible = true">
          <el-scrollbar>
            <div class="MobileAside-Inner">
              <div
                v-if="!payOptions?.success && !countdownObj?.expired" v-loading="orderDetail.loading"
                class="CheckoutPage-Content-Info"
              >
                <p>优惠券码</p>
                <ChoreCouponSelector v-model="payOptions.code" modal-class="CheckOut-Drawer" placeholder="可选" />
              </div>
              <div v-if="!payOptions.unavailable" v-loading="orderDetail.loading" class="CheckoutPage-Content-Info">
                <ul v-if="orderDetail.info?.meta">
                  <p>概述信息</p>
                  <li>
                    <span op-75>订单信息</span>
                    <span>{{ orderDetail.info.name }}</span>
                  </li>
                  <li v-if="orderDetail.info.meta?.range">
                    <span op-75>有效期限</span>
                    <span>{{ orderDetail.info.meta.range }}</span>
                  </li>
                  <li v-if="!payOptions.unavailable">
                    <span op-75>购买时间</span>
                    <span>{{ formatDate(payOptions.countdown.created || payOptions.now) }}</span>
                  </li>
                  <li v-if="!payOptions.unavailable">
                    <span op-75>取消截至</span>
                    <span>{{ formatDate(calcExpired(payOptions.countdown.created || payOptions.now)) }}</span>
                  </li>
                </ul>
                <ul v-if="orderDetail.info?.meta">
                  <p>支付信息</p>
                  <li>
                    <span op-75>标准费率</span>
                    <span>{{ (orderDetail.info.meta.originPrice / 100).toFixed(2) }}￥</span>
                  </li>
                  <li :class="{ discount: orderDetail.info.meta.originPrice > orderDetail.info.meta.fee }">
                    <span op-75>优惠价格</span>
                    <span>-{{ ((orderDetail.info.meta.originPrice - orderDetail.info.meta.fee) / 100).toFixed(2)
                    }}￥</span>
                  </li>
                  <li v-if="orderDetail.info.meta.average">
                    <span op-75>平均费率</span>
                    <span>{{ (orderDetail.info.meta.average / 100).toFixed(2) }}/天 ￥</span>
                  </li>
                  <li>
                    <span op-75>标准税费</span>
                    <span>+{{ ((orderDetail.info.meta.tax / 100).toFixed(2)) }} ￥</span>
                  </li>
                </ul>
                <ul class="line">
                  <p>账单总计</p>
                  <span>{{ ((orderDetail.info?.meta?.feeTax ?? 0) / 100).toFixed(2) }}￥</span>
                </ul>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <div
          v-if="!countdownObj?.expired && !payOptions.unavailable" v-loading="orderDetail.loading"
          class="CheckoutPage-Content-Info Confirm"
        >
          <div flex items-center>
            <ThCheckBox v-model="payOptions.agreement" />&nbsp;<el-text>
              购买即代表您已阅读同意<el-link target="_blank" :href="getProtocolUrl('subscription_service')">
                《使用服务协议》
              </el-link> 和<el-link target="_blank" :href="getProtocolUrl('thisai_privacy')">
                《用户隐私协议》
              </el-link>
            </el-text>
          </div>
          <ShiningButton :class="{ shrink: !payOptions.agreement }" @click="submit">
            {{ orderDetail.id ? '继续支付' : '确认支付' }}<span mx-2 font-bold class="price">{{ ((orderDetail.info?.meta?.feeTax
              ?? 0) / 100).toFixed(2) }}</span>元
          </ShiningButton>
        </div>
        <div
          v-else-if="countdownObj?.expired" v-loading="orderDetail.loading" flex items-center
          class="CheckoutPage-Content-Info Confirm"
        >
          <TextShaving style="width: max-content" text="订单已失效" />
        </div>
        <div v-else v-loading="orderDetail.loading" flex items-center class="CheckoutPage-Content-Info Confirm">
          <TextShaving style="width: max-content" text="当前计划不可用" />
        </div>
      </div>
    </div>

    <div class="CheckoutPage-Footer">
      <Logo />Powered by QuotaWish.
    </div>

    <BuyDialog
      ref="dialog" v-model="payOptions.dialog" z-2 :countdown="countdownObj" :price="payOptions.price"
      :method="payments.select" @order="handleOrderEstablished"
    />
  </div>
</template>

<style lang="scss">
.CheckoutPage-Header .AccountAvatar {
  position: relative;

  top: 0;
  right: 0;
}

.CheckOut-Drawer > div {
  width: 85% !important;
}
</style>

<style lang="scss" scoped>
.slider {
  position: absolute;

  width: 100px;
  height: 8px;

  top: 1rem;
  left: 50%;

  border-radius: 12px;
  transform: translateX(-50%);
  background-color: var(--el-border-color-darker);
}

.CheckoutPage-MobileNav {
  z-index: 1;
  position: sticky;
  padding: 1rem;
  display: flex;

  left: 0;
  bottom: 0;

  gap: 1rem;
  flex-direction: column;
  justify-content: center;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}

div.MobileAside {
  .MobileAside-InnerMain {
    position: relative;

    height: 100%;
  }

  .MobileAside-Inner {
    position: relative;
    padding: 1rem 0;
    display: flex;

    gap: 0.5rem;
    max-height: 55vh;
    flex-direction: column;
  }

  :deep(.CheckoutPage-Content-Info) {
    margin: 0 1rem;

    border-radius: 12px;
  }

  :deep(.Confirm) {
    padding: 1rem;
    margin: 0;

    border-radius: 0;
  }

  &.visible {
    .CheckoutPage-Aside {
      transform: translateY(0%);
    }
    opacity: 1;
    pointer-events: auto;
  }

  .CheckoutPage-Aside {
    position: absolute;
    padding: 3rem 0 0 0;

    width: 100%;
    bottom: 0;
    max-height: 90vh;

    border-radius: 18px 18px 0 0;
    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color);
    transform: translateY(100%);
  }
  z-index: 2;
  position: absolute;

  width: 100%;
  left: 0;
  bottom: 0;
  height: 100%;

  opacity: 0;
  pointer-events: none;
  transition: 0.25s;

  background-color: var(--el-overlay-color-lighter);
}

.CheckoutPage-MainContainer {
  z-index: 1;
  position: absolute;
  // padding: 1rem 0;
  display: flex;

  align-items: center;

  top: 0px;
  left: 0;

  width: 100%;
  height: 100%;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
}

.CheckoutPage-Main {
  & > p {
    text-indent: 0.5rem;

    font-size: 28px;
    font-weight: 600;
  }

  position: relative;
  padding: 3rem 0;
  display: flex;

  width: 60%;
  min-width: 720px;
  height: 100%;

  top: 60px;
  left: 50%;

  gap: 0.5rem;
  flex-direction: column;
  justify-content: center;

  transform: translate(-50%, 0%);
}

.pay-stamp {
  position: absolute;
  padding: 0.25rem 0.5rem;

  top: 50%;
  right: 0;

  font-size: 16px;
  font-weight: normal;

  color: #000;
  border-radius: 12px;
  background-color: #23d96e50;
  transform: translateY(-50%);
  box-shadow: 0 0 12px 4px #23d96e50;
  border: 1px solid var(--el-color-success);
}

.CheckoutPage-Header {
  z-index: 2;
  position: absolute;
  padding: 1rem 2rem;
  display: flex;

  align-items: center;
  justify-content: space-between;
  // justify-content: flex-start;

  top: 0;
  left: 0;

  width: 100%;

  height: 60px;

  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

div.CheckoutPage-Footer {
  z-index: 0;
  position: absolute;
  padding: 0.5rem 0;
  display: flex;

  bottom: 0;
  width: max-content;

  flex: 1;
  align-items: center;

  transform: translateX(-50%) scale(0.75);
}

div.Confirm {
  .Btn {
    &.shrink {
      margin: 0;

      max-height: 0;
    }

    margin: 2rem 0 0;

    border-radius: 16px;

    width: 100%;

    max-height: 50px;
  }

  padding: 1.5rem 1rem;

  flex-direction: column;
}

.Options {
  ul {
    li {
      &.trial {
        &::before {
          content: '试用';
          padding: 0.125rem 0.5rem;

          border-radius: 12px;
          background-color: var(--theme-color-light);
        }

        // background-color: var(--theme-color-light);
      }

      &.active {
        border: 2px solid var(--theme-color);
      }

      padding: 0.5rem 1rem;

      display: flex;
      align-items: center;
      gap: 0.5rem;

      img {
        width: 1.5rem;
        height: 1.5rem;
      }

      cursor: pointer;
      border-radius: 16px;
      background-color: var(--el-bg-color-page);

      transition: 0.25s;
      border: 2px solid #0000;
    }

    display: flex;

    gap: 1rem;

    flex-wrap: wrap;
  }
}

:deep(.CheckoutPage-Content-Info) {
  & > p,
  & div.title {
    span {
      margin: 0 8px;
      font-size: 20px;
      opacity: 0.5;
    }

    position: relative;

    padding: 1rem 0;

    font-size: 22px;
    font-weight: 600;

    border-bottom: 1px solid var(--el-border-color);
  }

  ul {
    li {
      display: flex;

      justify-content: space-between;

      margin: 0.25rem;

      font-size: 14px;

      &.free {
        opacity: 0.75;
      }
    }

    margin: 1rem 2px;
  }

  padding: 1rem 1.5rem;

  border-radius: 12px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
}

.CheckoutPage-Content {
  position: relative;
  display: flex;

  gap: 1rem;

  width: 100%;

  flex-wrap: wrap;
  justify-content: space-between;
}

.CheckoutPage-ContentInner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.CheckoutPage-Aside {
  // padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ul {
    & > p {
      padding: 1rem 0;

      font-size: 20px;
      font-weight: 600;

      border-bottom: 1px solid var(--el-border-color);
    }

    &.line {
      & > p {
        border-bottom: none;
      }

      & > span {
        font-size: 20px;
        font-weight: 600;
      }

      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      border-top: 1px solid var(--el-border-color);
    }

    margin: 0;

    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    li {
      &.discount {
        & :last-child {
          color: var(--el-color-danger);

          font-weight: 600;
        }
      }

      position: relative;

      display: flex;
      justify-content: space-between;
    }
  }

  width: 320px;

  // border-radius: 12px;
  // box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
  // border: 1px solid var(--el-border-color);
}

@media (max-width: 768px) {
  .CheckoutPage-Main {
    padding: 0;

    max-width: 100%;
    min-width: 100%;
  }

  div.pay-stamp {
    // font-size: 10px !important;
    padding: 0.125rem 0.25rem;

    transform: scale(0.75) translateY(-50%);
  }

  :deep(div.CheckoutPage-Content-Info) {
    & > p,
    & div.title {
      span {
        margin: 0 4px;
        font-size: 18px;
      }

      padding: 0.25rem 0;

      font-size: 16px;

      border: none;
    }

    ul {
      li {
        margin: 0.125rem;
      }

      margin: 0.5rem 0.5rem;
    }

    padding: 0.5rem 0.75rem;

    border-radius: 0;
    box-shadow: var(--el-box-shadow-light);
    background-color: var(--el-bg-color);
    border: none;
  }

  .CheckoutPage-HeadTitle {
    margin: 1rem 0.5rem;

    display: flex;

    flex-direction: column;
  }

  .Options ul {
    li {
      padding: 0.25rem 0.5rem;

      font-size: 12px;
    }

    gap: 0.25rem;
  }
}
</style>
