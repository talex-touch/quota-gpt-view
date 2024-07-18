export interface AccountDetail {
  token: string
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
}

export const userStore = useLocalStorage<Partial<AccountDetail>>('user', {})

watch(() => userStore.value.token, async (state) => {
  state && getAccountDetail(state).then(async (res) => {
    const json = await res.json()

    Object.assign(userStore.value, json.data)
  })
}, { deep: true, immediate: true })

export function getAccountDetail(token?: string) {
  return fetch(`${EndUrl}/account/profile`, {
    headers: {
      Authorization: `Bearer ${token ?? userStore.value.token}`,
    },
  })
}

export function updateAccountDetail(obj: { nickname: string, avatar: string }) {
  return fetch(`${EndUrl}/account/update`, {
    method: 'PUT',
    headers: {
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.value.token}`,
    },
    body: JSON.stringify(obj),
  })
}
