<script setup lang="ts">
import LoginCore from './login/LoginCore.vue'
import ThCheckBox from '~/components/checkbox/ThCheckBox.vue'

const props = defineProps<{
  show: boolean
}>()

const emits = defineEmits<{
  (e: 'modelValue:show'): void
}>()

const show = useVModel(props, 'show', emits)
const data = reactive({
  account: '',
  passwd: '',
  agreement: false,
})
</script>

<template>
  <div :class="{ show }" class="Login" @click="show = false">
    <div class="Login-Container" @click.stop="show = true">
      <div class="Login-Head">
        <h1 font-bold>
          <p>登录后</p>
          尽情和<span class="name">ThisAI</span>畅聊
        </h1>

        <LoginCore />
      </div>

      <div class="Login-Main">
        <div class="Login-Main-Major">
          <p>手机登录</p>

          <el-form>
            <el-input size="large">
              <template #prepend>
                +86
              </template>
            </el-input>
            <el-input size="large">
              <template #append>
                <el-button>发送验证码</el-button>
              </template>
            </el-input>
            <el-button v-wave size="large" type="primary">
              登 录
            </el-button>
          </el-form>
        </div>
        <div class="Login-Main-Vice">
          <p>微信扫码登录</p>

          <el-image />
        </div>
      </div>

      <div class="Login-Supper">
        <ThCheckBox v-model="data.agreement" />&nbsp;登录即代表您已阅读同意《使用服务协议》和《用户隐私协议》
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.Login-Main-Major {
  .el-form {
    display: flex;

    flex-direction: column;

    gap: 1.5rem;
  }
  width: 60%;
}

.Login-Main-Vice {
  padding-left: 2rem;

  border-left: 1px solid var(--el-border-color);

  width: 40%;
}

.Login-Main {
  & div > p {
    margin: 0.75rem 0 2rem;

    font-size: 16px;
    font-weight: 600;
  }
  z-index: 5;
  position: relative;
  display: flex;
  padding: 1rem 2rem;

  gap: 2rem;
  justify-content: space-between;

  height: calc(100% - 200px);
}

.Login-Supper {
  position: absolute;
  display: flex;

  align-items: center;
  justify-content: center;

  bottom: 0;

  width: 100%;
  height: 80px;

  opacity: 0.75;
  font-size: 14px;
}

.Login-Head {
  .login-core {
    position: absolute;

    top: 1rem;
    right: 2rem;
  }

  .name {
    &::before {
      content: '';
      position: absolute;

      left: 0;
      bottom: 0;

      height: 2px;
      width: 100%;

      border-radius: 4px;
      background: linear-gradient(
        to right,
        var(--el-color-primary),
        var(--el-bg-color-page),
        var(--el-color-primary)
      );
    }
    position: relative;
  }
  position: relative;
  padding: 1.5rem;

  font-size: 24px;

  height: 120px;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.Login-Container {
  .show & {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  position: absolute;
  // padding: 1rem;

  top: 50%;
  left: 50%;

  width: 620px;
  height: 500px;

  opacity: 0;
  overflow: hidden;
  border-radius: 16px;
  box-sizing: border-box;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  transform: translate(-50%, -50%) scale(1.25);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.Login {
  &.show {
    opacity: 1;
    pointer-events: all;
  }
  z-index: 2000;
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  opacity: 0;
  pointer-events: none;
  background: var(--el-overlay-color-lighter);
  backdrop-filter: blur(18px) saturate(180%);
  transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
