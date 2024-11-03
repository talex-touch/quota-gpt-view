<script lang="ts" name="TipTap" setup>
import Mention from '../icon/Mention.vue'
import { TipType } from '#imports'
import type { ITip } from '~/composables/tip/tipper'

const props = defineProps < {

  close: Function

  tip: ITip
} >()
const shade = ref(false)
const msg = ref('')

watchEffect(async () => {
  const content = props.tip.message

  shade.value = true

  await sleep(100)
  msg.value = content
  await sleep(300)

  shade.value = false
})

let timer: any
async function stayTimer(time: number) {
  clearTimeout(timer)

  if (time <= 0)
    return

  timer = setTimeout(() => {
    if (props.tip.loading)
      return

    props.close()
  }, time)
}

watchEffect(() => {
  const { stay, loading } = props.tip

  if (stay > 0 && !loading)
    stayTimer(stay)
})

const type = computed(() => props.tip.type)
</script>

<template>
  <div
    :message="msg" class="TapTip" :class="{
      'info-tip': type === TipType.INFO,
      'warn-tip': type === TipType.WARNING,
      'error-tip': type === TipType.ERROR,
      'success-tip': type === TipType.SUCCESS,
      'loading-tip': tip.loading,
      'text-shade': shade,
    }"
  >
    {{ msg }}
    <div class="TapTip-Icon-Wrapper">
      <Mention :mode="tip.loading ? 'loading' : type" />
    </div>
  </div>
</template>

<style lang="scss">
@keyframes whole-shade {
  0% {
    filter: blur(0px);
    transform: scale(1);
  }

  50% {
    filter: blur(10px);
    transform: scale(0.75);
  }

  100% {
    filter: blur(0px);
    transform: scale(1);
  }
}

@keyframes text-shade {
  0% {
    opacity: 1;
    transform: translate(0, -50%) translateX(0);
  }

  25% {
    opacity: 0;
    transform: translate(0, -50%) translateX(5px);
  }

  75% {
    opacity: 0;
    transform: translate(0, -50%) translateX(-5px);
  }

  100% {
    opacity: 1;
    transform: translate(0, -50%) translateX(0);
  }
}

.TapTip {
  .TapTip-Icon-Wrapper {
    position: relative;

    top: -5px;
    left: -24px;

    width: 16px;
    height: 16px;

    transform: scale(0.5);
    --bg-color: var(--theme-color);
  }

  &:before {
    z-index: 0;
    content: '';
    position: absolute;

    width: 100%;
    height: 100%;

    top: 0;
    left: 0;

    border-radius: 8px;
    //background-color: var(--el-bg-color);
    filter: invert(5%);
    box-shadow: var(--el-box-shadow-light);
    backdrop-filter: contrast(200%) saturate(180%) blur(10px);
    transition: 0.5s;
  }

  &:after {
    z-index: 10;
    content: attr(message);
    position: absolute;

    width: 100%;
    //height: 100%;

    top: 50%;
    left: 0;

    text-align: center;
    transform: translate(0, -50%);
    transition: 0.25s;
  }

  position: relative;
  display: flex;
  padding: 0.75rem 0.5rem 0.75rem calc(0.5rem + 32px);

  max-width: 100%;
  width: max-content;
  height: 30px;
  font-size: 18px;
  // line-height: 30px;
  text-indent: 16px;

  align-items: center;
  justify-content: center;
  flex-direction: row-reverse;

  color: var(--theme-color, var(--el-text-color-primary));
  border-radius: 8px;
  user-select: none;
  transition:
    box-shadow 0.5s,
    0.25s;

  --bg-color: --theme-color;
}

.TapTip.text-shade {
  &:after {
    animation: text-shade 0.5s;
  }

  animation: whole-shade 0.1s 0.05s;
}

.success-tip {
  --theme-color: var(--el-color-success);
  --theme-light-color: var(--el-color-success-light-5);
}

.info-tip {
  --theme-color: var(--el-color-primary);
  --theme-light-color: var(--el-color-primary-light-5);
}

.warn-tip {
  --theme-color: var(--el-color-warning);
  --theme-light-color: var(--el-color-warning-light-5);
}

.error-tip {
  --theme-color: var(--el-color-error);
  --theme-light-color: var(--el-color-error-light-5);
}

.loading-tip {
  box-shadow:
    0 0 2px 0 var(--theme-color) inset,
    0 0 4px 2px var(--theme-light-color);
}
</style>
