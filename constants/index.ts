export const appName = 'ThisAI - Quota'
export const appDescription = 'THISAI'

export const ENDS_URL = {
  dev: 'http://127.0.0.1:7001/',
  prod: 'https://quota.api.tagzxia.com/',
}

// eslint-disable-next-line node/prefer-global/process
export const EndNormalUrl = window?.process?.dev ? ENDS_URL.dev : ENDS_URL.prod
