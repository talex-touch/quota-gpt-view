<script setup lang="ts">
import { setWallpaper, themeColors, themeOptions, viewTransition, wallpapers } from '~/composables/theme/colors'
import ShiningButton from '~/components/button/ShiningButton.vue'
import TextShaving from '~/components/other/TextShaving.vue'

definePageMeta({
  layout: 'personal',
})

const colorMode = useColorMode()

function toggleTheme(event: MouseEvent, theme: 'auto' | 'light' | 'dark') {
  viewTransition(event, theme)
}
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p class="title-theme">
        外观设置
      </p>
    </div>

    <div class="ProfileWrapper-Main">
      <el-scrollbar>
        <div class="ProfileWrapper-MainWrapper">
          <p>选择你喜欢的主题颜色</p>
          <div class="ProfileWrapper-Theme">
            <div
              v-for="(color, index) in themeColors" :key="color" :class="{ active: themeOptions.color === index }"
              class="theme-color" :style="`--c: ${color}`" @click="themeOptions.color = index"
            />
          </div>

          <div class="ProfileWrapper-Display">
            <p>选择UI主题界面</p>
            <p op-50>
              设置你的自定义主题
            </p>

            <div my-4 class="ProfileWrapper-Display-Theme">
              <ThemeBlock :active="colorMode.preference === 'system'" theme="system" @click="toggleTheme($event, 'auto')" />
              <ThemeBlock :active="colorMode.preference === 'light'" theme="light" @click="toggleTheme($event, 'light')" />
              <ThemeBlock
                :active="colorMode.preference === 'dark'" theme="dark" @click="toggleTheme($event, 'dark')"
              />
            </div>
          </div>

          <div my-12 class="ProfileWrapper-Wallpaper">
            <div flex justify-between pr-8 class="ProfileWrapper-WallpaperHeader">
              <div class="wallpaper-start">
                <p>自定义你的界面墙纸</p>
                <p op-50>
                  设置你的自定义墙纸
                </p>
              </div>

              <div v-if="themeOptions.theme" flex class="wallpaper-end">
                当前选择：{{ themeOptions.theme }}
                <el-button type="danger" @click="setWallpaper(null)">
                  重置
                </el-button>
              </div>
            </div>

            <div my-4 class="ProfileWrapper-Display-Theme">
              <div
                v-for="wallpaper in wallpapers" :key="wallpaper.label" :style="`--t: ${wallpaper.color}`"
                :class="{ active: wallpaper.id === themeOptions.theme }" class="Wallpaper-Item"
                @click="setWallpaper(wallpaper)"
              >
                <img :alt="wallpaper.label" :src="wallpaper.wallpaper" class="Wallpaper-Item-Img">
                <span>{{ wallpaper.label }}</span>
              </div>
            </div>
          </div>

          <br>
        </div>
      </el-scrollbar>
    </div>

    <div class="ProfileWrapper-Footer">
      <TextShaving text="外观自定义需要高级订阅来启用" />

      <ShiningButton>
        立即订阅 PRO
      </ShiningButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ProfileWrapper-WallpaperHeader {
  .wallpaper-end {
    // flex-direction: column;

    gap: 0.5rem;
    align-items: center;
    margin-right: 2rem;
  }
}

.Wallpaper-Item {
  img {
    width: 100%;
    height: 100%;

    border-radius: 8px;
  }

  span {
    position: absolute;
    display: flex;
    padding: 0.25rem 0.5rem;

    align-items: flex-end;

    width: calc(100% - 8px);

    left: 4px;
    bottom: 4px;

    height: 48px;

    color: #fff;
    border-radius: 0 0 8px 8px;
    background: linear-gradient(to top, var(--t, #000), #0000);
  }

  &.active {
    border-radius: 12px;

    border: 1px solid var(--t, var(--el-color-primary));
  }

  position: relative;
  padding: 4px;

  width: 320px;
  height: 180px;

  cursor: pointer;
}

.ProfileWrapper-Display-Theme {
  flex-wrap: wrap;
}

.ProfileWrapper-MainWrapper {
  height: 750px;
}

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
      left: 6px;

      // width: 10px;
      height: 3px;

      transform: rotate(45deg);
    }

    &::after {
      top: 15.5px;
      left: 10.5px;

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

.ProfileWrapper div.ProfileWrapper-Footer {
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
