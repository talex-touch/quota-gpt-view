<script setup lang="ts">
import LoginCore from './login/LoginCore.vue'
import { Platform, getQrCodeStatus, postQrCodeReq, qrCodeLogin, sendSMSCode, useSMSLogin } from '~/composables/api/auth'
import ThCheckBox from '~/components/checkbox/ThCheckBox.vue'
import { $handleUserLogin } from '~/composables/user'

const props = defineProps<{
  show: boolean
}>()

const emits = defineEmits<{
  (e: 'modelValue:show'): void
}>()

const codeStatus = ref(0)
let startTime = Date.now()

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
const codeData = useLocalStorage('code-data', {
  expired: true,
  lastFetch: -1,
  data: {},
})
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

async function handleLogin() {
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

  // Internal Test
  // const res = await doAccountExist(phone)
  // if (!res.data) {
  //   ElMessage.error('请先通过内测资格后再登录使用！')
  //   return
  // }

  const button = document.getElementById('captcha-button')
  button?.click()
}

const smsOptions = reactive({
  lastSent: -1,
  loading: false,
  title: '发送验证码',
  disabled: false,
  smsLogin: false,
})

function refreshSmsTitle() {
  const diff = Date.now() - smsOptions.lastSent
  if (diff > 60000) {
    smsOptions.title = '发送验证码'
    smsOptions.disabled = false
  }
  else {
    smsOptions.disabled = true
    smsOptions.title = `${(60 - Math.floor(diff / 1000)).toString().padStart(2, '0')}s后重发`
    setTimeout(refreshSmsTitle, 1000)
  }
}

watch(() => show.value, (val) => {
  if (val)
    startTime = Date.now()
})

onMounted(async () => {
  data.agreement = localStorage.getItem('user') != null

  newCaptcha(CaptchaSceneId.Auth, '#captcha-element', '#captcha-button', {
    captchaVerifyCallback: async (param: string) => {
      const _res = {
        captchaResult: false, // 验证码验证是否通过，boolean类型，必选 result.captchaVerifyResult
        bizResult: false, // 业务验证是否通过，boolean类型，可选；若为无业务验证结果的场景，bizResult可以为空
      }

      if (data.mode === 'code') {
        if (smsOptions.disabled) {
          _res.captchaResult = true

          return _res
        }
        smsOptions.loading = true

        try {
          const res = await sendSMSCode(data.account.replaceAll(' ', ''), param)
          const result = await res.json()
          if (result.code !== 1002)
            _res.captchaResult = true

          if (result.message === 'sms-sent-err') {
            ElMessage.error('无法向目标手机号发送消息，请稍后重试！')
          }
          else if (result.code === 200) {
            smsOptions.lastSent = Date.now()

            refreshSmsTitle()

            ElMessage.success('发送成功！')
          }
        }
        catch (e) {
          console.error(e)

          ElMessage.error('发送失败！')
        }

        smsOptions.loading = false
      }
      else {
        try {
          smsOptions.smsLogin = true
          const state = (codeStatus.value !== 4 || codeData.value.expired) ? undefined : (codeData.value.data as any)?.loginCode

          const res = await useSMSLogin(data.account.replaceAll(' ', ''), data.code, param, state)
          const result = await res.json()
          if (result.code !== 1002)
            _res.captchaResult = true

          if (result.code === 1003)
            ElMessage.error('短信验证码有误')
          else
            _res.bizResult = true

          if (result.code === 200) {
            if (!result.data) {
              ElMessage.error(result.message)
              smsOptions.smsLogin = false
            }
            else {
              setTimeout(() => {
                localStorage.removeItem('code-data')

                $handleUserLogin(result.data)

                ElMessage.info('登录成功！')

                show.value = false
              }, 200)
            }
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

  if (document.body.classList.contains('mobile'))
    return

  await fetchCode()

  codeStatusTimer()
})

async function fetchCode() {
  let { lastFetch, data: _data, expired } = codeData.value

  if (Date.now() - lastFetch >= 280000 || expired) {
    codeData.value.lastFetch = Date.now()

    const res: any = await postQrCodeReq(Platform.WECHAT)

    if (res.code === 200) {
      codeData.value.data = _data = res.data
      codeData.value.expired = false
    }
  }
}

async function codeStatusTimer() {
  if (userStore.value.isLogin)
    return

  // 如果超过2分钟用户啥也没做就不要她登陆了 免得一直ddos后台
  if (Date.now() - startTime >= 120000)
    show.value = false

  if (props.show)
    await _codeStatusTimer()

  setTimeout(codeStatusTimer, 2000)
}

async function _codeStatusTimer() {
  const _codeData: any = codeData.value.data
  if (!_codeData || !_codeData.loginCode)
    return await fetchCode()

  if (codeData.value.expired)
    return

  const { lastFetch, data: _data } = codeData.value
  const res = await getQrCodeStatus(Platform.WECHAT, _codeData.loginCode)
  if (res.data === null || Date.now() - lastFetch >= 280000) {
    codeData.value.expired = true
    codeStatus.value = 0
    return
  }

  codeStatus.value = res.data
}

watch(() => codeStatus.value, async (status) => {
  if (status !== 3)
    return

  // 用户已经用短信验证码登录了就不要处理这个请求了 防止二次无效登录
  if (smsOptions.smsLogin)
    return

  const _codeData: any = codeData.value.data

  const res: any = await qrCodeLogin(_codeData.loginCode)

  localStorage.removeItem('code-data')

  if (res.code !== 200) {
    ElMessage.error(res.message || '登录失败！')
    return
  }

  setTimeout(() => {
    $handleUserLogin(res.data)
    // userStore.value.token = (res.data.token)

    ElMessage.info('登录成功！')

    show.value = false
  }, 500)
})

// @ts-expect-error force exist
const codeUrl = computed(() => `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${codeData.value.data?.ticket}`)
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
        <div :class="{ bind: codeStatus === 4 }" class="Login-Main-Major">
          <p>手机登录</p>

          <div id="captcha-element" absolute />
          <button id="captcha-button" absolute />

          <div class="indicator" />

          <el-form>
            <el-input v-model="data.account" maxlength="13" :parser="parser" :formatter="formatter" size="large">
              <template #prepend>
                +86
              </template>
            </el-input>
            <el-input v-model="data.code" maxlength="6" size="large">
              <template #append>
                <el-button
                  v-wave :loading="smsOptions.loading"
                  :disabled="smsOptions.disabled || data.account.length !== 13" @click="handleSendCode"
                >
                  {{ smsOptions.title }}
                </el-button>
              </template>
            </el-input>
            <el-button v-wave size="large" type="primary" :disabled="data.code.length !== 6" @click="handleLogin">
              登 录
            </el-button>
          </el-form>
        </div>
        <div class="Login-Main-Vice only-pc-display">
          <p>微信扫码登录</p>

          <div class="Login-Main-Vice-Wrapper">
            <div v-if="!data.agreement" class="scanned">
              <div i-carbon:list-checked />
              <p>协议</p>
              <span>你需要同意协议</span>
            </div>
            <div v-else-if="codeData.expired" cursor-pointer class="scanned" @click="fetchCode">
              <div i-carbon:ibm-cloud-direct-link-1-dedicated />
              <p>已过期</p>
              <span>点击刷新验证码</span>
            </div>
            <div v-else-if="codeStatus === 4" class="scanned">
              <div i-carbon:notification />
              <p>需要绑定</p>
              <span>请输入手机号进行绑定</span>
            </div>
            <div v-else-if="codeStatus === 3" class="scanned">
              <div i-carbon:devices />
              <p>正在登录</p>
              <span>请稍等，正在登录...</span>
            </div>
            <div v-else-if="codeStatus !== 0" class="scanned">
              <div i-carbon:checkmark-filled />
              <p>已扫码</p>
              <span>请在手机上确认登录</span>
            </div>

            <el-image style=" border-radius: 12px;" :src="codeUrl" />
          </div>
        </div>
      </div>

      <div class="Login-Supper">
        <ThCheckBox v-model="data.agreement" />&nbsp;登录即代表您已阅读同意《使用服务协议》和《用户隐私协议》
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.Login-Main-Vice-Wrapper {
  position: relative;

  .scanned {
    & > div {
      width: 32px;
      height: 32px;

      // color: var(--el-color-success);
    }

    z-index: 1;
    position: absolute;
    padding: 1rem;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    border-radius: 12px;
    background: var(--el-overlay-color-lighter);
    backdrop-filter: blur(5px);
    color: white;
    font-size: 14px;

    & > div {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}

.Login-Main-Major {
  .el-form {
    display: flex;

    flex-direction: column;

    gap: 1.5rem;

    .el-input {
      --el-input-bg-color: #0000 !important;
    }
  }

  width: 60%;
}

@keyframes arrow_shaving {
  0%,
  100% {
    width: 60px;
    transform: translateX(10px);
  }

  50% {
    width: 50px;
    transform: translateX(0px);
  }
}

@keyframes arrow_shaving_before {
  0%,
  100% {
    width: 30px;
    transform: translate(-1px, 0px) rotate(45deg);
  }

  50% {
    width: 25px;
    transform: translate(-1px, 0px) rotate(30deg);
  }
}

@keyframes arrow_shaving_after {
  0%,
  100% {
    width: 30px;
    transform: translate(-2px, 1px) rotate(-45deg);
    filter: drop-shadow(0 0 2px var(--el-color-primary));
  }

  50% {
    width: 25px;
    transform: translate(-2px, 1px) rotate(-30deg);
    filter: drop-shadow(0 0 16px var(--el-color-primary));
  }
}

.indicator {
  .bind & {
    opacity: 1;
  }

  &::before,
  &::after {
    z-index: 1;
    content: '';
    position: absolute;

    top: 0;
    left: 2px;

    width: 30px;
    height: 4px;

    border-radius: 8px;
    transition: cubic-bezier(0.165, 0.84, 0.44, 1);
    background-color: var(--el-color-primary);
  }

  &::before {
    transform: translate(-1px, 0px) rotate(45deg);
    animation: arrow_shaving_before 1s infinite;
    transform-origin: left top;
  }

  &::after {
    transform: translate(-2px, 1px) rotate(-45deg);
    animation: arrow_shaving_after 1s infinite;
    transform-origin: left top;
  }

  z-index: 10;
  position: absolute;

  top: 102px;
  left: 350px;

  width: 60px;
  height: 5px;

  opacity: 0;
  transition: 0.25s;
  border-radius: 8px;
  animation: arrow_shaving 1s infinite;
  background-color: var(--el-color-primary);
  filter: drop-shadow(0 0 4px var(--el-color-primary));
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

.mobile .Login-Container {
  .Login-Main-Major {
    width: 100%;
  }

  width: 95%;
  height: 60%;
}
</style>
