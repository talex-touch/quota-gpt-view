import { createApp } from 'vue'
import LoadingIcon from '~/components/icon/LoadingIcon.vue'

const loadingDirective = {
  mounted(el: HTMLElement) {
    const wrapper = document.createElement('div')

    wrapper.className = 'LoadingWrapper transition-cubic'

    const app = createApp(LoadingIcon)

    el.appendChild(wrapper)

    // @ts-expect-error exist force
    el._t_loading = {
      app,
      wrapper,
    }

    wrapper.style.opacity = '0'
    wrapper.style.pointerEvents = 'none'
    app.mount(wrapper)
  },
  beforeUpdate(el: HTMLElement, binding: any) {
    if (!el._t_loading) {
      console.error('a', el)

      return
    }
    // @ts-expect-error exist force
    const { wrapper, timer } = el._t_loading

    clearTimeout(timer)

    if (binding.value) {
      // @ts-expect-error exist force
      el._t_loading.timer = setTimeout(() => {
        wrapper.style.opacity = '.55'
        wrapper.style.pointerEvents = ''
      }, 200)
    }
    else {
      wrapper.style.opacity = '0'
      wrapper.style.pointerEvents = 'none'
    }
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('loader', loadingDirective)
})
