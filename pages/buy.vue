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
import { getOrderPlanPrice, getOrderStatus } from '~/composables/api/account'

const route = useRoute()
const router = useRouter()

const subscriptionMode = computed(() => route.query?.type === 'SUBSCRIPTION')

function buyEffect() {
  const confetti = new JSConfetti()

  confetti.addConfetti({
    emojis: ['🎉', '🎊', '🎈', '🎁', '🎉', '🎊', '🎈', '🎁'],
    confettiNumber: 100,
  })
}

// onMounted(() => buyEffect())

definePageMeta({
  layout: 'default',
})

const orderInfo = reactive<any>([
  {
    label: '概述信息',
    children: [],
  },
  {
    label: '支付信息',
    price: true,
    children: [],
  },
  {
    label: '账单总计',
    value: '0.00 ￥',
  },
])

const orderDetail = reactive<any>({
  id: '',
  loading: false,
  info: [

  ],
})

const payments = reactive<any>({
  select: 'wechat',
  children: [
    {
      svg: WechatPay,
      value: 'wechat',
      name: '微信支付',
    },
    {
      svg: AliPay,
      value: 'alipay',
      name: '支付宝支付',
    },
    {
      svg: Balance,
      value: 'balance',
      name: '余额支付',
    },
  ],
})

const plans = reactive([...SUBSCRIPTION_PLAN_LIST])

const payOptions = reactive({
  now: -1,
  type: 'STANDARD',
  time: 'MONTH',
  dialog: false,
  agreement: true,
  price: 0,
  code: '',
  unavailable: false,
  countdown: {
    created: 0,
    upto: 0,
  },
  success: false,
})

function parseDataInfo(data: any) {
  orderDetail.info = [...data.info]
  orderInfo[0].children = [{
    name: '订单信息',
    value: data.name,
  }, {
    name: '有效期限',
    value: `${data.meta.range} 天`,
  }, {
    name: '购买时间',
    value: '-',
  }, {
    name: '取消截至',
    value: '-',
  }]

  const { fee, average, originPrice, tax, feeTax } = data.meta

  orderInfo[1].children = [
    {
      name: '标准费率',
      value: (originPrice / 100).toFixed(2),
    },
    {
      name: '优惠价格',
      value: `-${((originPrice - fee) / 100).toFixed(2)}`,
    },
    {
      name: '平均费率',
      value: `${(average / 100).toFixed(2)}/天`,
    },
    {
      name: '标准税费',
      value: `+${(tax / 100).toFixed(2)}`,
    },

  ]

  orderInfo[2].value = `${(feeTax / 100).toFixed(2)
    } ￥`

  payOptions.price = feeTax

  router.push({
    query: {
      ...route.query,
      plan: payOptions.type,
      time: payOptions.time,
    },
  })
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
  })
}

let func: any

function timer() {
  if (payOptions.success)
    return

  payOptions.now = Date.now()

  // update overview
  if (!payOptions.unavailable && orderInfo[0]?.children.length === 4) {
    const nowTime = formatDate(payOptions.now, 'YYYY/MM/DD HH:mm:ss')

    orderInfo[0].children[2].value = nowTime
    orderInfo[0].children[3].value = formatDate(payOptions.now + 4 * 60 * 60 * 1000, 'YYYY/MM/DD HH:mm:ss')
  }

  func?.()

  setTimeout(timer, 100)
}

onMounted(() => {
  if (route.query?.orderId) {
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

      parseDataInfo(info.meta.subscription)

      if (data.status !== 1)
        return

      payOptions.success = true

      const nowTime = formatDate(data.createdAt, 'YYYY/MM/DD HH:mm:ss')

      orderInfo[0].children[2].value = nowTime
      orderInfo[0].children[3].value = formatDate(payOptions.now + 4 * 60 * 60 * 1000, 'YYYY/MM/DD HH:mm:ss')

      buyEffect()

      orderInfo[2].value = `${(info.meta.subscription.meta.fee / 100).toFixed(2)
        } ￥`

      // 删除 orderInfo[1].children 最后一个成员
      orderInfo[1].children.pop()
    })
  }

  else if (route.query?.plan && route.query?.time) {
    const plan = plans.find(plan => plan.type === route.query?.plan && plan.time === route.query?.time)
    if (plan)
      selectPlan(plan)
  }

  timer()
})

function submit() {
  if (payOptions.unavailable)
    return

  payOptions.dialog = true
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

    setTimeout(async () => await router.push({
      path: '/',
      query: { data: 'plan' },
    }), 2000)
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
  console.log('e', data)

  orderDetail.id = data.order.id
  const createdAt = new Date(data.order.createdAt)
  payOptions.countdown = {
    created: createdAt.getTime(),
    upto: createdAt.getTime() + 5 * 60 * 1000,
  }

  // 更新总价
  orderInfo[2].value = `${(data.order.totalAmount / 100).toFixed(2)
    } ￥`

  router.push({
    path: '/buy',
    query: {
      orderId: orderDetail.id,
    },
  })

  let ctn = 0
  func = async () => {
    ctn += 1
    if (ctn < 20)
      return

    ctn = 0

    const status = await getOrderStatus(data.order.id)

    if (status.data.status !== 0) {
      func = null

      paySuccess(status.data)
    }
  }
}

watch(() => payOptions.code, () => {
  selectPlan()
})
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <el-page-header title="返回" @back="router.push('/?data=plan')">
        <template #content>
          <span class="text-large mr-3 font-600">
            <span v-if="orderDetail.id">订单详情</span>
            <span v-else-if="subscriptionMode">选择订阅</span>
            <span v-else>充值余额</span>
          </span>
        </template>
      </el-page-header>
    </div>

    <div class="ProfileWrapper-MainContainer">
      <el-scrollbar>
        <div class="ProfileWrapper-Main">
          <p>
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

          <div class="ProfileWrapper-Content">
            <div class="ProfileWrapper-ContentInner">
              <OtherWarnAlert v-if="countdownObj?.expired" icon="i-carbon:information" title="订单超时">
                订单已关闭
              </OtherWarnAlert>
              <OtherWarnAlert v-else-if="orderDetail.id && countdownObj" icon="i-carbon:information" title="您的订单将被保留">
                我们将您的订单保留至 {{ countdownObj.uptoText }}。你可以随时继续支付这个订单。
              </OtherWarnAlert>

              <div v-if="subscriptionMode && !orderDetail.id" class="ProfileWrapper-Content-Info Options">
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
              <div v-else-if="!orderDetail.id" class="ProfileWrapper-Content-Info">
                <p>充值余额</p>
              </div>
              <div v-if="!payOptions.unavailable" class="ProfileWrapper-Content-Info">
                <div class="title">
                  订单详情<span v-if="orderDetail.id">#{{ orderDetail.id }}</span>

                  <div v-if="payOptions.success" class="pay-stamp">
                    <TextShaving text="已支付" />
                  </div>
                </div>
                <ul v-loading="orderDetail.loading">
                  <li v-for="line in orderDetail.info" :key="line.name" :class="{ free: line.free }">
                    <span>{{ line.name }}</span>
                    <span v-if="!line.free">{{ (line.price / 100).toFixed(2) }}￥</span>
                    <span v-else>附赠</span>
                  </li>
                </ul>
              </div>
              <div
                v-if="!payOptions.unavailable" v-loading="orderDetail.loading"
                class="ProfileWrapper-Content-Info Payments"
              >
                <p>支付方式</p>
                <ul>
                  <li
                    v-for="payment in payments.children" :key="payment.value"
                    :class="{ active: payments.select === payment.value, disabled: countdownObj?.expired || payOptions.success }"
                    @click="payments.select = payment.value"
                  >
                    <img :src="payment.svg">{{ payment.name }}
                  </li>
                </ul>
              </div>
              <div class="ProfileWrapper-Content-Info">
                <OtherDefaultAlert icon="i-carbon:manage-protection" title="随时取消政策">
                  在科塔锐行，我们深知计划可能随时发生变化。为此，我们特别设计了一套取消政策，旨在为您带来最大的灵活性与安心保障。当您选择我们时，您将享有充分的自由度来调整或取消预订，无需担心任何取消费用。我们的政策允许您在购买后<span
                    font-bold
                  >3 小时</span>内免费修改订单，确保您的计划能够灵活适应各种突发状况。<el-link type="primary">
                    了解更多
                  </el-link>
                </OtherDefaultAlert>
              </div>
            </div>
            <div class="ProfileWrapper-Aside">
              <!-- && !payOptions.unavailable -->
              <div
                v-if="!payOptions?.success && !countdownObj?.expired" v-loading="orderDetail.loading"
                class="ProfileWrapper-Content-Info"
              >
                <p>优惠券码</p>
                <ChoreCouponSelector v-model="payOptions.code" placeholder="可选" />
              </div>
              <div v-if="!payOptions.unavailable" v-loading="orderDetail.loading" class="ProfileWrapper-Content-Info">
                <ul v-for="item in orderInfo" :key="item.label" :class="{ line: item.value }">
                  <p>{{ item.label }}</p>
                  <template v-if="item.children">
                    <li v-for="line in item.children" :key="line.name" :class="{ discount: +line.value < 0 }">
                      <span op-75>
                        {{ line.name }}
                      </span>
                      <span>
                        {{ line.value }}
                        <span v-if="item.price" class="price">￥</span>
                      </span>
                    </li>
                  </template>
                  <span v-else-if="item.value">
                    {{ item.value }}
                  </span>
                </ul>
              </div>

              <div
                v-if="payOptions?.success" v-loading="orderDetail.loading" flex items-center
                class="ProfileWrapper-Content-Info Confirm"
              >
                <div flex items-center>
                  <ThCheckBox v-model="payOptions.agreement" />&nbsp;使用即代表您已阅读同意《使用服务协议》和《订单退款协议》
                </div>
                <ShiningButton :class="{ shrink: !payOptions.agreement }">
                  售后咨询
                </ShiningButton>
              </div>
              <div
                v-else-if="!countdownObj?.expired && !payOptions.unavailable" v-loading="orderDetail.loading"
                class="ProfileWrapper-Content-Info Confirm"
              >
                <div flex items-center>
                  <ThCheckBox v-model="payOptions.agreement" />&nbsp;购买即代表您已阅读同意《使用服务协议》和《用户隐私协议》
                </div>
                <ShiningButton :class="{ shrink: !payOptions.agreement }" @click="submit">
                  {{ orderDetail.id ? '继续支付' : '确认支付' }}
                </ShiningButton>
              </div>
              <div
                v-else-if="countdownObj?.expired" v-loading="orderDetail.loading" flex items-center
                class="ProfileWrapper-Content-Info Confirm"
              >
                <TextShaving style="width: max-content" text="订单已失效" />
              </div>
              <div v-else v-loading="orderDetail.loading" flex items-center class="ProfileWrapper-Content-Info Confirm">
                <TextShaving style="width: max-content" text="当前计划不可用" />
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div class="ProfileWrapper-Footer">
      <Logo />Powered by QuotaWish.
    </div>

    <BuyDialog
      v-model="payOptions.dialog"
      z-2 :coupon-code="payOptions.code" :countdown="countdownObj"
      :type="payOptions.type" :time="payOptions.time" :price="payOptions.price" :method="payments.select"
      @order="handleOrderEstablished"
    />
  </div>
</template>

<style lang="scss">
.ProfileWrapper-Header .AccountAvatar {
  position: relative;

  top: 0;
  right: 0;
}
</style>

<style lang="scss" scoped>
.ProfileWrapper-MainContainer {
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

.ProfileWrapper-Main {
  & > p {
    text-indent: 0.5rem;

    font-size: 28px;
    font-weight: 600;
  }
  position: relative;
  padding: 3rem 0;
  display: flex;

  width: 60%;
  min-width: 1080px;
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

.ProfileWrapper-Header {
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

div.ProfileWrapper-Footer {
  z-index: 0;
  position: absolute;
  padding: 0.5rem 0;
  display: flex;

  bottom: 0;

  align-items: center;

  transform: scale(0.75) translateX(-50%);
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

.Payments {
  ul {
    li {
      &.active {
        border: 2px solid var(--theme-color);
      }
      &.disabled {
        opacity: 0.75;
        pointer-events: none;
      }

      padding: 0.5rem 1rem;

      display: flex;
      align-items: center;
      gap: 0.5rem;

      img {
        width: 1.5rem;
        height: 1.5rem;

        .dark & {
          filter: invert(1);
        }
      }

      cursor: pointer;
      border-radius: 16px;
      background-color: var(--el-bg-color-page);

      transition: 0.25s;
      border: 2px solid #0000;
    }

    display: flex;

    gap: 1rem;
  }
}

.ProfileWrapper-Content-Info {
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

.ProfileWrapper-Content {
  display: flex;

  gap: 1rem;

  justify-content: space-between;
}

.ProfileWrapper-ContentInner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.ProfileWrapper-Aside {
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

.title-theme {
  &::before {
    z-index: -1;
    content: 'PAYMENT ORDER';
    position: absolute;

    opacity: 0.5;

    letter-spacing: 1rem;
    font-size: 1.5rem;

    transform: translate(8rem, 0.125rem);
  }
}
</style>
