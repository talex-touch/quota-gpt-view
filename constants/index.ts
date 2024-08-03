export const appName = 'ThisAI - Quota'
export const appDescription = 'THISAI'

export const ENDS_URL = {
  dev: {
    label: 'Development',
    value: 'https://dev.quotawish.com/',
  },
  test: {
    label: 'Test',
    value: 'https://test.quotawish.com/',
  },
  prod: {
    label: 'Production',
    value: 'https://api.quotawish.com/',
  },
}

let _ENDS_URL = ''

// Object.assign(globalThis, '$ENDS_URL', {
//   get() {
//     return _ENDS_URL
//   },
// })

// declare global {
//   interface Window {
//     $ENDS_URL: string
//   }
// }

// export const EndNormalUrl = ENDS_URL.prod

// (import.meta.env.DEV) ? ENDS_URL.dev : ENDS_URL.prod

export class GlobalOptions {
  constructor() {
    this.setEndsUrl((import.meta.env.DEV) ? ENDS_URL.dev.value : ENDS_URL.prod.value)
  }

  setEndsUrl(url: string) {
    _ENDS_URL = url

    this.updateUrlStash.forEach((callback) => {
      callback(url)
    })
  }

  getEndsUrl() {
    return _ENDS_URL
  }

  updateUrlStash: any[] = []

  onUpdateUrl(callback: (url: string) => void) {
    this.updateUrlStash.push(callback)
  }
}

export const globalOptions = new GlobalOptions()
