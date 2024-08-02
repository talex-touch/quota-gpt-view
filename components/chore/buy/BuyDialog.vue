<script setup lang="ts">
import WechatPay from '/svg/wechat-pay.svg'
import AliPay from '/svg/ali-pay.svg'
import Balance from '/svg/balance.svg'

const props = defineProps<{
  modelValue: boolean
  method: string

  price: number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emits('update:modelValue', false)
}

const show = useVModel(props, 'modelValue', emits)
</script>

<template>
  <div class="BuyDialog" :class="{ show }">
    <div :class="[method]" class="BuyDialog-Main">
      <div class="BuyDialog-Close" @click="close">
        <div i-carbon:close />
      </div>

      <template v-if="method === 'wechat'">
        <p class="title">
          <img :src="WechatPay">微信支付
        </p>

        <p class="price">
          <span>￥</span>{{ (price / 100).toFixed(2) }}
        </p>

        <div class="PayCode">
          <img src="/share-code.svg">
        </div>

        <div class="mention">
          <div i-carbon:scan-alt />
          请使用微信扫一扫完成支付
        </div>
      </template>
      <template v-else-if="method === 'alipay'">
        当前还不支持这种方式
      </template>
      <template v-else-if="method === 'balance'">
        你没有足够的余额
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.BuyDialog-Main {
  & > p.title {
    display: flex;

    gap: 1rem;
    font-size: 20px;
    font-weight: 600;
    align-items: center;
  }

  & > p.price {
    span {
      position: relative;

      top: -2px;

      font-size: 22px;
    }
    margin: 1rem 0;

    font-size: 24px;
    font-weight: 600;
  }

  .mention {
    margin: 1rem 0;
    display: flex;

    gap: 0.5rem;
    font-size: 14px;
    align-items: center;
  }

  .PayCode {
    padding: 5px;

    width: 280px;
    height: 280px;

    border: 1px solid var(--el-border-color);
  }

  display: flex;

  flex-direction: column;

  align-items: center;
  justify-content: center;
}

.BuyDialog-Close {
  &:hover {
    color: var(--el-color-danger);
  }
  position: absolute;
  display: flex;

  top: 0;
  right: 0;

  width: 24px;
  height: 24px;

  cursor: pointer;

  align-items: center;
  justify-content: center;

  border-radius: 50%;
  transform: translate(50%, -50%);
  background-color: var(--el-bg-color-page);
}

.BuyDialog {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(2px);
  background-color: var(--el-mask-color-extra-light);
  // z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  &.show {
    opacity: 1;
    pointer-events: auto;
  }
  & > div {
    &.wechat {
      width: 720px;
      height: 500px;
    }
    &.alipay {
      width: max-content;
    }
    &.balance {
      width: max-content;
    }
    position: relative;
    background-color: var(--el-bg-color-page);
    border-radius: 8px;

    padding: 2rem;

    box-shadow: var(--el-box-shadow);
    // width: 80%;
    // max-width: 800px;
    // max-height: 80%;
  }
}
</style>
