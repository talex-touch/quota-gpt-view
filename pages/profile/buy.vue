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
import { getOrderPlanPrice } from '~/composables/api/account'

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
})

function selectPlan(plan: any) {
  payOptions.type = plan.type
  payOptions.time = plan.time
}

function timer() {
  payOptions.now = Date.now()

  // update overview
  if (!payOptions.unavailable && orderDetail[0]?.children.length === 4) {
    const nowTime = formatDate(payOptions.now, 'YYYY/MM/DD HH:mm:ss')

    orderInfo[0].children[2].value = nowTime
    orderInfo[0].children[3].value = formatDate(payOptions.now + 4 * 60 * 60 * 1000, 'YYYY/MM/DD HH:mm:ss')
  }

  setTimeout(timer, 500)
}

onMounted(() => {
  if (route.query?.plan && route.query?.time) {
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

watchEffect(() => {
  // get plan
  const plan = plans.find(plan => plan.type === payOptions.type && plan.time === payOptions.time)
  if (!plan)
    return // impossible

  console.log('a', plan)

  // 后面的 scope 是监测不到变化的，放心用REFLECT

  setTimeout(async () => {
    orderDetail.loading = true

    // fetch data
    const res = await getOrderPlanPrice(payOptions.type as any, payOptions.time)

    if (!res.data) {
      payOptions.unavailable = true
    }
    else {
      payOptions.unavailable = false
      payOptions.price = res.data
    }

    orderDetail.loading = false

    function mapperTime(time: any) {
      switch (time) {
        case 'MONTH':
          return '1个月 (30天)'
        case 'QUARTER':
          return '1个季度 (90天)'
        case 'YEAR':
          return '1年 (365天)'
        default:
          return time
      }
    }

    orderDetail.info = [...plan.info]
    orderInfo[0].children = [{
      name: '订单信息',
      value: plan.name,
    }, {
      name: '有效期限',
      value: mapperTime(plan.time),
    }, {
      name: '购买时间',
      value: '',
    }, {
      name: '取消截至',
      value: '',
    }]

    orderInfo[1].children = [
      {
        name: '标准费率',
        value: payOptions.price / 100,
      },
      {
        name: '优惠价格',
        value: `0.00`,
      },
      {
        name: '标准税费',
        value: '0.00',
      },
      {
        name: '平均费率',
        value: '0.00',
      },
    ]

    orderInfo[2].value = `${(payOptions.price / 100).toFixed(2)
      } ￥`

    router.push({
      query: {
        ...route.query,
        plan: plan.type,
        time: plan.time,
      },
    })
  })
})
</script>

<template>
  <div class="ProfileWrapper">
    <!-- <div class="ProfileWrapper-Steps">
      <el-steps style="max-width: 600px" :active="payOptions.step">
        <el-step title="Step 1" />
        <el-step title="Step 2" />
      </el-steps>
    </div> -->

    <div class="ProfileWrapper-Main">
      <p>
        结账
        <span
          v-if="subscriptionMode"
          style="font-size: 18px;font-weight: normal;opacity: 0.65"
        >现在选择适合你的订阅，邀请用户可得返现哦。</span>
        <span v-else style="font-size: 18px;font-weight: normal;opacity: 0.65">平台倡导量入为出，请理性消费。未成年人下单前必须由监护人同意。</span>
      </p>

      <div class="ProfileWrapper-Content">
        <div class="ProfileWrapper-ContentInner">
          <OtherWarnAlert v-if="orderDetail.id" icon="i-carbon:information" title="您的订单将被保留">
            我们将您的订单保留至 2024/08/02 09:17:02。你可以随时取消这个订单。
          </OtherWarnAlert>

          <div v-if="subscriptionMode" class="ProfileWrapper-Content-Info Options">
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
          <div v-else class="ProfileWrapper-Content-Info">
            <p>充值余额</p>
          </div>
          <div v-if="!payOptions.unavailable" class="ProfileWrapper-Content-Info">
            <p>订单详情<span v-if="orderDetail.id">#{{ orderDetail.id }}</span></p>
            <ul v-loading="orderDetail.loading">
              <li v-for="line in orderDetail.info" :key="line.name" :class="{ free: line.free }">
                <span>{{ line.name }}</span>
                <span v-if="!line.free">{{ line.price.replace("%total%", (payOptions.price / 100).toFixed(2)) }}￥</span>
                <span v-else>附赠</span>
              </li>
            </ul>
          </div>
          <div
            v-if="!payOptions.unavailable" v-loading="orderDetail.loading"
            class="ProfileWrapper-Content-Info Payments"
          >
            <p>支付详情</p>
            <ul>
              <li
                v-for="payment in payments.children" :key="payment.value"
                :class="{ active: payments.select === payment.value }" @click="payments.select = payment.value"
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
          <div v-if="!payOptions.unavailable" v-loading="orderDetail.loading" class="ProfileWrapper-Content-Info">
            <ul v-for="item in orderInfo" :key="item.label" :class="{ line: item.value }">
              <p>{{ item.label }}</p>
              <template v-if="item.children">
                <li v-for="line in item.children" :key="line.name">
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

          <div v-if="!payOptions.unavailable" v-loading="orderDetail.loading" class="ProfileWrapper-Content-Info">
            <p>优惠券码</p>
            <el-input v-model="payOptions.code" placeholder="可选" />
          </div>

          <div
            v-if="!payOptions.unavailable" v-loading="orderDetail.loading"
            class="ProfileWrapper-Content-Info Confirm"
          >
            <div flex items-center>
              <ThCheckBox v-model="payOptions.agreement" />&nbsp;购买即代表您已阅读同意《使用服务协议》和《用户隐私协议》
            </div>
            <ShiningButton :class="{ shrink: !payOptions.agreement }" @click="submit">
              确认支付
            </ShiningButton>
          </div>
          <div v-else v-loading="orderDetail.loading" flex items-center class="ProfileWrapper-Content-Info Confirm">
            <TextShaving style="width: max-content" text="当前计划不可用" />
          </div>
        </div>
      </div>
    </div>

    <div class="ProfileWrapper-Footer">
      <Logo />Powered by QuotaWish.
    </div>

    <BuyDialog v-model="payOptions.dialog" :price="payOptions.price" :method="payments.select" />
  </div>
</template>

<style lang="scss" scoped>
div.ProfileWrapper-Footer {
  z-index: -1;
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
  }
}

.ProfileWrapper-Content-Info {
  & > p {
    span {
      margin: 0 8px;
      font-size: 20px;
      opacity: 0.5;
    }

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

.ProfileWrapper-Main {
  & > p {
    text-indent: 0.5rem;

    font-size: 28px;
    font-weight: 600;
  }

  position: absolute;
  display: flex;

  width: 60%;
  min-width: 1080px;

  top: 50%;
  left: 50%;

  gap: 1rem;
  flex-direction: column;

  transform: translate(-50%, -50%);
}

.ProfileWrapper-Content {
  display: flex;

  gap: 3rem;

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
