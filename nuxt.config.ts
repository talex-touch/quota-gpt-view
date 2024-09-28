import { sentryVitePlugin } from "@sentry/vite-plugin";
import { pwa } from './config/pwa'
import { appDescription } from './constants/index'

export default defineNuxtConfig({
  modules: [
    '@element-plus/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
    'v-wave/nuxt',
    'nuxt-echarts',
    ['vite-plugin-version-date-mark/nuxt', {
      name: 'THISAI',
      ifShortSHA: true,
      ifMeta: true,
      ifLog: true,
      ifGlobal: true,
    }],
    '@nuxtjs/device',
  ],

  vWave: {
    color: 'currentColor',
    initialOpacity: '0.5',
    easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  },

  elementPlus: {

  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  css: [
    '@unocss/reset/tailwind.css',
  ],

  colorMode: {
    classSuffix: '',
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: false,
      routes: ['/'],
      ignore: ['/hi'],
    },
  },

  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: 'white' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#222222' },
      ],
      script: [
        { async: true, src: 'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js' },
        // { async: true, src: 'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.30.js' },
        // { async: true, src: 'https://sf1-scmcdn-cn.feishucdn.com/obj/feishu-static/op/fe/devtools_frontend/remote-debug-0.0.1-alpha.6.js' },
        // { async: true, src: 'https://unpkg.com/vconsole/dist/vconsole.min.js' },
        // 百度统计
        { async: true, src: 'https://hm.baidu.com/hm.js?6830ca6f4f5dae8e112f5912e489d5eb' },
      ],
    },
  },

  pwa,

  devtools: {
    enabled: true,
  },

  features: {
    // For UnoCSS
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  build: {
    sourcemap: true
  },

  plugins: [sentryVitePlugin({
    org: "quotawish",
    project: "javascript-vue"
  })]
})