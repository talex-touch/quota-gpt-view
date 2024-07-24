export const appName = 'ThisAI - Quota'
export const appDescription = 'THISAI'

export const ENDS_URL = {
  dev: 'http://127.0.0.1:7001/',
  prod: 'https://quota.api.tagzxia.com/',
}

// export const EndNormalUrl = (import.meta.env.DEV) ? ENDS_URL.dev : ENDS_URL.prod
export const EndNormalUrl = ENDS_URL.prod