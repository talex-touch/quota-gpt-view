<script setup lang="ts">
import LoginCore from './login/LoginCore.vue'
import { sendSMSCode, useSMSLogin } from '~/composables/api/auth'
import ThCheckBox from '~/components/checkbox/ThCheckBox.vue'

const props = defineProps<{
  show: boolean
}>()

const emits = defineEmits<{
  (e: 'modelValue:show'): void
}>()

function formatter(value: string) {
  // 移除所有非数字字符
  const cleaned = value.replace(/\D/g, '')

  // 判断手机号长度
  if (cleaned.length >= 8) {
    const part1 = cleaned.slice(0, 3)
    const part2 = cleaned.slice(3, 7)
    const part3 = cleaned.slice(7, 11)
    return `${part1} ${part2} ${part3}`
  }
  else if (cleaned.length >= 4 && cleaned.length < 8) {
    const part1 = cleaned.slice(0, 3)
    const part2 = cleaned.slice(3)
    return `${part1} ${part2}`
  }
  else if (cleaned.length < 4) {
    return cleaned
  }
  else {
    // 如果长度不符合手机号码规则，返回原始值
    return value
  }
}

function parser(input: string) {
  // 去除前后空格并保留原始格式
  let trimmedInput = input.trim()

  // 确保输入只包含数字和空格
  if (!/^\d+( \d+)*$/.test(trimmedInput))
    return input // 返回原始输入

  // 去除多余的空格
  trimmedInput = trimmedInput.replace(/\s+/g, ' ').trim()

  // 处理不同情况
  const match = trimmedInput.match(/^(1\d{0,10})$/)
  if (match) {
    if (match[1].length <= 3)
      return match[1]
    else if (match[1].length <= 7)
      return `${match[1].slice(0, 3)} ${match[1].slice(3)}`
    else
      return `${match[1].slice(0, 3)} ${match[1].slice(3, 7)} ${match[1].slice(7)}`
  }

  return input // 返回原始输入
}

const show = useVModel(props, 'show', emits)
const data = reactive({
  mode: 'code',
  account: '',
  code: '',
  agreement: false,
})

function handleSendCode() {
  data.mode = 'code'
  if (!data.agreement) {
    ElMessage.info('请先同意协议！')
    return
  }

  const phone = data.account.replaceAll(' ', '')
  if (phone.length !== 11) {
    ElMessage.error('请输入正确的手机号！')
    return
  }

  const button = document.getElementById('captcha-button')
  button?.click()
}

function handleLogin() {
  data.mode = 'login'
  if (!data.agreement) {
    ElMessage.info('请先同意协议！')
    return
  }

  const phone = data.account.replaceAll(' ', '')
  if (phone.length !== 11) {
    ElMessage.error('请输入正确的手机号！')
    return
  }

  if (+data.code < 100000 || +data.code > 999999) {
    ElMessage.error('请输入正确的验证码！')
    return
  }

  const button = document.getElementById('captcha-button')
  button?.click()
}

onMounted(() => {
  newCaptcha(CaptchaSceneId.Auth, '#captcha-element', '#captcha-button', {
    captchaVerifyCallback: async (param: string) => {
      const _res = {
        captchaResult: false, // 验证码验证是否通过，boolean类型，必选 result.captchaVerifyResult
        bizResult: false, // 业务验证是否通过，boolean类型，可选；若为无业务验证结果的场景，bizResult可以为空
      }

      if (data.mode === 'code') {
        try {
          const res = await sendSMSCode(data.account.replaceAll(' ', ''), param)
          const result = await res.json()
          if (result.code !== 1002)
            _res.captchaResult = true

          if (result.message === 'sms-sent-err')
            ElMessage.error('无法向目标手机号发送消息！')

          console.log('a', result)
        }
        catch (e) {
          console.error(e)

          ElMessage.error('发送失败！')
        }
      }
      else {
        try {
          const res = await useSMSLogin(data.account.replaceAll(' ', ''), data.code, param)
          const result = await res.json()
          if (result.code !== 1002)
            _res.captchaResult = true

          if (result.code === 1003)
            ElMessage.error('短信验证码有误')
          else
            _res.bizResult = true

          if (result.code === 200) {
            userStore.value.token = (result.data.token)

            ElMessage.info('登录成功！')

            show.value = false
          }

          console.error(result)
        }
        catch (e) {
          console.error(e)

          ElMessage.error('发送失败！')
        }
      }

      return _res
    },
    onBizResultCallback: () => void 0,
  })
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

          <div id="captcha-element" absolute />
          <button id="captcha-button" absolute />

          <el-form>
            <el-input v-model="data.account" maxlength="13" :parser="parser" :formatter="formatter" size="large">
              <template #prepend>
                +86
              </template>
            </el-input>
            <el-input v-model="data.code" maxlength="6" size="large">
              <template #append>
                <el-button v-wave :disabled="data.account.length !== 13" @click="handleSendCode">
                  发送验证码
                </el-button>
              </template>
            </el-input>
            <el-button v-wave size="large" type="primary" :disabled="data.code.length !== 6" @click="handleLogin">
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