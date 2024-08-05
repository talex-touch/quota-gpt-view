import { createApp } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click', {
    mounted(el: HTMLElement, bindings) {
      el.addEventListener('click', () => {
        if (bindings.value) {
          // copy to clipboard
          navigator.clipboard.writeText(bindings.value)

          ElMessage.success('复制成功！')
        }
      })
    },
  })
})
