import './index'
import { getAccountDetail, getPermissionList, getUserSubscription } from './api/account'
import { endHttp } from './api/axios'
import { $endApi } from './api/base'

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

export const userConfig = ref<{
  pub_info: any
  pri_info: any
  loading: boolean
}>({
  pub_info: {},
  pri_info: {
    cms: {
      apps: [],
    },
    home: {
      index: {},
      chat: {},
    },
  },
  loading: false,
})

console.log('u', userConfig)

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
export async function saveUserConfig() {
  const res = await $endApi.v1.account.postUserConfig(
    JSON.stringify(userConfig.value.pub_info),
    JSON.stringify(userConfig.value.pri_info),
  )

  userConfig.value.loading = false

  return responseMessage(res, {
    success: '',
  })
}

// watch(() => userStore.value.token, async () => {
//   if (!userStore.value.isLogin)
//     return

//   await refreshCurrentUserRPM()
//   await refreshUserSubscription()
// }, { deep: true, immediate: true })

$event.on('USER_LOGIN_SUCCESS', async () => {
  console.log('login success', userConfig)
})

export async function $handleUserLogin(token: { accessToken: string, refreshToken: string }) {
  userStore.value.token = token

  await refreshCurrentUserRPM()
  await refreshUserSubscription()

  $event.emit('USER_LOGIN_SUCCESS')
}

export async function $handleUserLogout() {
  const router = useRouter()

  await router.push('/')

  if (!userStore.value.isLogin)
    console.warn(`User not login now.`)

  userStore.value = {}

  $event.emit('USER_LOGOUT_SUCCESS')
}

export async function refreshUserSubscription() {
  const { data } = await getUserSubscription()
  if (!data)
    return

  userStore.value.subscription = data
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

  Object.assign(userConfig.value.pri_info, JSON.parse(config.pri_info || ''))
  Object.assign(userConfig.value.pub_info, JSON.parse(config.pub_info || ''))
}

export function updateAccountDetail(obj: { nickname: string, avatar: string }) {
  return endHttp.put(`account/update`, obj)
}

export function userHavePermission(permission: string) {
  if (userStore.value.isAdmin)
    return true

  return userStore.value.permissions?.includes(permission)
}
