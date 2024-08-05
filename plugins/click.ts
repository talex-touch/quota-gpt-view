import { createApp } from 'vue'


/**
 * 定义一个Nuxt插件，用于在Vue组件中添加点击复制功能
 * @param {Object} nuxtApp - Nuxt应用实例
 * @returns {Object} 返回一个Nuxt插件配置对象
 */
export default defineNuxtPlugin((nuxtApp) => {
  // 在Vue应用中注册一个自定义指令`click`
  nuxtApp.vueApp.directive('click', {
      // 当指令所在元素挂载到DOM后执行
    mounted(el: HTMLElement, bindings) {
      // 添加点击事件监听器到元素
      el.addEventListener('click', () => {
         // 如果绑定的值存在，则执行复制操作
        if (bindings.value) {
            // 使用浏览器API将绑定的值复制到剪贴板
          navigator.clipboard.writeText(bindings.value)

          ElMessage.success('复制成功！')
        }
      })
    },
  })
})
