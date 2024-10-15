import './index'
import { getAccountDetail, getPermissionList, getUserSubscription } from './api/account'
import { endHttp } from './api/axios'
import { $endApi } from './api/base'
import { $event } from './events'
import { LogoutType } from './events/logout'

export interface AccountDetail {
  id: number

  token: {
    accessToken: string
    refreshToken: string
  }

  createdAt: string
  updatedAt: string
  username: string
  nickname: string
  avatar: string
  qq: string
  email: string
  phone: string
  remark: string
  status: number
  roles: string[]
  permissions: string[]
  subscription: any

  isAdmin: boolean
  isLogin: boolean
}

export const userStore = useLocalStorage<Partial<AccountDetail>>('user', {})

const rawUserConfig = {
  pub_info: {},
  pri_info: {
    cms: {
      expand: false,
      apps: [],
    },
    home: {
      index: {},
      chat: {},
    },
    info: {
      tutorial: true,
    },
    appearance: {
      theme: '',
      expand: false,
      immersive: true,
    },
  },
  loading: false,
}
export const userConfig = ref(JSON.parse(JSON.stringify(rawUserConfig)))

watch(() => userStore.value.token?.accessToken, (token) => {
  userStore.value.isLogin = !!token
}, { immediate: true })

watch(() => userStore.value.isLogin, () => {
  if (!userStore.value.isLogin)
    return false

  if (userStore.value.roles?.find((item: any) => item.id === 1))
    return userStore.value.isAdmin = true

  userStore.value.isAdmin = !!userStore.value.permissions?.find((item: any) => item === 'system:manage')
}, { immediate: true })

// manually trigger
async function _saveUserConfig() {
  const res = await $endApi.v1.account.postUserConfig(
    JSON.stringify(userConfig.value.pub_info),
    JSON.stringify(userConfig.value.pri_info),
  )

  userConfig.value.loading = false

  return responseMessage(res, {
    success: '',
  })
}

export const saveUserConfig = useDebounceFn(_saveUserConfig)

// watch(() => userStore.value.token, async () => {
//   if (!userStore.value.isLogin)
//     return

//   await refreshCurrentUserRPM()
//   await refreshUserSubscription()
// }, { deep: true, immediate: true })

$event.on('USER_LOGIN_SUCCESS', async () => {
  console.log('login success', userConfig)
})

$event.on('USER_LOGOUT_SUCCESS', async (type) => {
  if (!userStore.value.isLogin)
    console.warn(`User not login now.`)

  // userStore.value.token = { accessToken: '', refreshToken: '' }
  // userStore.value = {}
  userStore.value = { ...userStore.value, token: { accessToken: '', refreshToken: '' }, id: undefined, permissions: [], phone: undefined, roles: [], subscription: undefined }
  userConfig.value = JSON.parse(JSON.stringify(rawUserConfig))

  const router = useRouter()

  document.body.classList.remove('ULTIMATE', 'STANDARD', 'DEV')

  await router.push('/')

  if (type === LogoutType.TOKEN_EXPIRED) {
    ElMessage({
      message: '登录超时，请重新登录！',
      grouping: true,
      type: 'error',
      plain: true,
    })
  }
})

export async function $handleUserLogin(token: { accessToken: string, refreshToken: string }) {
  userStore.value.token = token

  await refreshCurrentUserRPM()
  await refreshUserSubscription()

  $event.emit('USER_LOGIN_SUCCESS')
}

export async function refreshUserSubscription() {
  const { data } = await getUserSubscription()
  if (!data)
    return

  userStore.value.subscription = data

  const plan = userStore.value.subscription

  document.body.classList.remove('ULTIMATE', 'STANDARD', 'DEV')

  if (plan)
    document.body.classList.add(plan.type)
}

/**
 * RPM: Role Permission Menu
 */
export async function refreshCurrentUserRPM() {
  const res = await getAccountDetail()
  Object.assign(userStore.value, res.data)

  const permissions = await getPermissionList()
  userStore.value.permissions = permissions.data

  const config = (await $endApi.v1.account.getUserConfig()).data || {}

  const priConfig = JSON.parse(config.pri_info || '{}')

  Object.assign(userConfig.value.pri_info, toReactive(priConfig))
  Object.assign(userConfig.value.pub_info, toReactive(JSON.parse(config.pub_info || '{}')))

  if (!document.body.classList.contains('mobile')) {
    if (userStore.value.isLogin && !priConfig?.info?.tutorial)
      userConfig.value.pri_info.info.tutorial = false
  }
}

export function updateAccountDetail(obj: { nickname: string, avatar: string }) {
  return endHttp.put(`account/update`, obj)
}

export function userHavePermission(permission: string) {
  if (userStore.value.isAdmin)
    return true

  return userStore.value.permissions?.includes(permission)
}
