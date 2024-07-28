<script setup lang="ts">
import ShiningButton from '~/components/button/ShiningButton.vue'
import TextShaving from '~/components/other/TextShaving.vue'
import { themeColors } from '~/composables/theme/colors'

definePageMeta({
  layout: 'personal',
})

const themeOptions = reactive({
  color: 0,
  theme: 0,
})
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p class="title-theme">
        外观设置
      </p>
    </div>

    <div class="ProfileWrapper-Main">
      <p>选择你喜欢的主题颜色</p>
      <div class="ProfileWrapper-Theme">
        <div v-for="(color, index) in themeColors" :key="color" :class="{ active: themeOptions.color === index }" class="theme-color" :style="`--c: ${color}`" @click="themeOptions.color = index" />
      </div>

      <div class="ProfileWrapper-Display">
        <p>选择UI主题界面</p>
        <p op-50>
          设置你的自定义主题
        </p>

        <div my-4 class="ProfileWrapper-Display-Theme">
          <ThemeBlock :active="true" theme="system" />
          <ThemeBlock :active="false" theme="light" />
          <ThemeBlock :active="false" theme="dark" />
        </div>
      </div>

      <div my-12 class="ProfileWrapper-Wallpaper">
        <p>自定义你的界面墙纸</p>
        <p op-50>
          设置你的自定义主题
        </p>

        <div my-4 class="ProfileWrapper-Display-Theme">
          <ThemeBlock :active="true" theme="system" />
          <ThemeBlock :active="false" theme="light" />
          <ThemeBlock :active="false" theme="dark" />
        </div>
      </div>
    </div>

    <div class="ProfileWrapper-Footer">
      <TextShaving text="外观自定义需要高级订阅来启用" />

      <ShiningButton>
        立即订阅 PRO
      </ShiningButton>
    </div>
  </div>
</template>

<style lang="scss">
.ProfileWrapper-Display {
  &-Theme {
    display: flex;

    gap: 0.5rem;
  }
  margin: 1rem 0;
}

.ProfileWrapper-Theme {
  div.theme-color {
    &.active {
      &::before {
        width: 10px;

        opacity: 1;
      }
      &::after {
        width: 15px;

        opacity: 1;
      }
    }

    &::before,
    &::after {
      content: '';
      position: absolute;

      top: 10px;
      left: 10px;

      width: 0;
      height: 3px;

      border-radius: 8px;
      background-color: #fff;

      opacity: 0;
      transition: 0.25s;
    }

    &::before {
      top: 18px;
      left: 7px;

      // width: 10px;
      height: 3px;

      transform: rotate(45deg);
    }

    &::after {
      top: 15px;
      left: 12px;

      // width: 15px;
      height: 3px;

      transform: rotate(-50deg);
    }

    position: relative;

    width: 32px;
    height: 32px;

    cursor: pointer;
    border-radius: 50%;
    background-color: var(--c);
  }
  padding: 0.5rem 0;
  display: flex;

  gap: 0.5rem;
  height: 48px;
}

div.ProfileWrapper-Footer {
  display: flex;

  justify-content: space-between;
}

.title-theme {
  &::before {
    z-index: -1;
    content: 'APPEARANCE';
    position: absolute;

    opacity: 0.5;

    letter-spacing: 1rem;
    font-size: 1.5rem;

    transform: translate(5rem, -0.25rem);
  }
}
</style>
