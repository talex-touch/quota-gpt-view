import { createApp } from 'vue'

function copyValue(bindings) {
  return () => {
    if (bindings.value) {
      // copy to clipboard
      navigator.clipboard.writeText(bindings.value)

      ElMessage.success('复制成功！')
    }
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('copy', {
    mounted(el: HTMLElement, bindings) {
      el.onclick = copyValue(bindings)
    },
    updated(el: HTMLElement, bindings) {
      el.onclick = copyValue(bindings)
    },
  })
})
