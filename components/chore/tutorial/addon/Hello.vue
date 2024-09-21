<script lang="ts" setup>
import Features from './Features.vue'

const handleNext: any = inject('handleNext')
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 110 51">
    <foreignObject width="100%" height="100%">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style="display: flex; align-items: center; height: 100%; justify-content: center;"
      >
        <div style="display: inline-flex; align-items: center; margin: 0 -8px 0 -6px;"><svg
          style="display: inline-block; width: 54px; height: 100%;" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 54 51" height="51" width="54"
        >
          <path
            stroke-dasharray="235" stroke-dashoffset="235" style="animation: draw 2.35s 0s forwards;"
            stroke="#3AB8FD" fill="none" stroke-linecap="round" stroke-linejoin="round"
            d="M35.957 3.99976C23.1235 22.025 18.442 31.2217 10.457 47.4998C26.957 5.99983 30.457 37.5 52.957 7.5C33.957 29.4998 32.957 37.6924 29.457 38.5C25.957 39.3076 0.957031 32.5 0.957031 29.4998C23.1446 22.8906 34.5662 20.6514 50.957 22.4998"
          />
        </svg></div>
        <div style="display: inline-flex; align-items: center; margin: 0 -4px 0 0;"><svg
          style="display: inline-block; width: 11px; height: 100%;" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 11 51" height="51" width="11"
        >
          <path
            stroke-dasharray="22" stroke-dashoffset="22" style="animation: draw 0.22s 2.35s forwards;"
            stroke="#3AB8FD" fill="none" stroke-linecap="round" stroke-linejoin="round"
            d="M3.07713 25.3392C3.03314 27.7282 6.78706 24.9554 6.03999 23.505C4.44172 21.2653 -0.294204 28.3892 2.71291 28.2186C5.35941 27.9626 10.2422 24.7207 10.2422 24.7207"
          />
        </svg></div>
        <div style="display: inline-flex; align-items: center; margin: 0 -12px 0 -4px;"><svg
          style="display: inline-block; width: 19px; height: 100%;" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 19 51" height="51" width="19"
        >
          <path
            stroke-dasharray="33" stroke-dashoffset="33"
            style="animation: draw 0.33s 2.5700000000000003s forwards;" stroke="#3AB8FD" fill="none"
            stroke-linecap="round" stroke-linejoin="round"
            d="M0.800781,34.0845C7.00167,23.7712 10.562,17.889 17.543,6.64502"
          />
        </svg></div>
        <div style="display: inline-flex; align-items: center; margin: 0 -12px 0 -4px;"><svg
          style="display: inline-block; width: 19px; height: 100%;" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 19 51" height="51" width="19"
        >
          <path
            stroke-dasharray="33" stroke-dashoffset="33"
            style="animation: draw 0.33s 2.9000000000000004s forwards;" stroke="#3AB8FD" fill="none"
            stroke-linecap="round" stroke-linejoin="round"
            d="M0.800781,34.0845C7.00167,23.7712 10.562,17.889 17.543,6.64502"
          />
        </svg></div>
        <div style="display: inline-flex; align-items: center; margin: 0 -2.5px 0 0;"><svg
          style="display: inline-block; width: 7px; height: 100%;" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 7 51" height="51" width="7"
        >
          <path
            stroke-dasharray="17" stroke-dashoffset="17"
            style="animation: draw 0.17s 3.2300000000000004s forwards;" stroke="#3AB8FD" fill="none"
            stroke-linecap="round" stroke-linejoin="round"
            d="M3.30217 23.604C2.72482 23.9566 0.574341 28.3484 1.66563 28.4119C2.75692 28.4755 7.24524 21.8731 4.4886 23.027C3.29045 23.5286 2.14727 24.4054 2.14727 24.4054"
          />
        </svg></div>
      </div>
    </foreignObject>
  </svg>

  <ButtonArrowButton
    class="delay-join" @click="handleNext({
      component: null,
      data: {},
    })"
  >
    开始使用
  </ButtonArrowButton>
</template>

<style>
button.delay-join {
  opacity: 0;
  pointer-events: none;
  animation: delay-join-frames 1s 5.5s forwards;
}

@keyframes delay-join-frames {
  from {
    opacity: 0;
    pointer-events: none;
  }

  to {
    opacity: 1;
    pointer-events: auto;
  }
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
