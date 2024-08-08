<script setup lang="ts">
import { setWallpaper, themeColors, themeOptions, viewTransition, wallpapers } from '~/composables/theme/colors'
import ShiningButton from '~/components/button/ShiningButton.vue'
import TextShaving from '~/components/other/TextShaving.vue'

const colorMode = useColorMode()

function toggleTheme(event: MouseEvent, theme: 'auto' | 'light' | 'dark') {
  viewTransition(event, theme)
}

const textList = reactive({
  ind: 0,
  list: [
    '主题界面永久免费',
    '立即订阅计划来解锁更多自定义',
    '自定义墙纸可以让界面更加纯粹',
    '不同墙纸可以搭配不同主题界面',
  ],
})
const textShaving = ref('')

function timer() {
  if (textList.ind >= textList.list.length - 1)
    textList.ind = 0
  else
    textList.ind++

  textShaving.value = textList.list[textList.ind]

  setTimeout(timer, 5000)
}

const loading = ref('')
async function trySetWallpaper(paper: any, event: Event) {
  if (loading.value)
    return

  if (themeOptions.value.theme === paper.id)
    return

  if (!paper.free && !userStore.value.subscription?.type) {
    ElMessage.error('很抱歉，此墙纸只供订阅用户使用！')
    return
  }

  loading.value = paper.id

  await sleep(600)

  // TODO: sync personal data to cloud

  await setWallpaper(paper, event as any)

  loading.value = ''
}

timer()
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
              <ThemeBlock
                :active="colorMode.preference === 'system'" theme="system"
                @click="toggleTheme($event, 'auto')"
              />
              <ThemeBlock
                :active="colorMode.preference === 'light'" theme="light"
                @click="toggleTheme($event, 'light')"
              />
              <ThemeBlock :active="colorMode.preference === 'dark'" theme="dark" @click="toggleTheme($event, 'dark')" />
            </div>
          </div>

          <div my-12 class="ProfileWrapper-Wallpaper">
            <div flex justify-between class="ProfileWrapper-WallpaperHeader">
              <div class="wallpaper-start">
                <p>自定义你的界面墙纸</p>
                <p op-50>
                  设置你的自定义墙纸
                </p>
              </div>

              <div v-if="themeOptions.theme" flex class="wallpaper-end">
                当前选择：{{ themeOptions.theme }}
                <el-button type="danger" @click="setWallpaper(null, $event)">
                  重置
                </el-button>
              </div>
            </div>

            <div my-4 class="ProfileWrapper-Display-Theme">
              <div
                v-for="wallpaper in wallpapers"
                :key="wallpaper.label" v-loader="loading === wallpaper.id" :style="`--t: ${wallpaper.color}`"
                :class="{ lock: !wallpaper?.free, active: wallpaper.id === themeOptions.theme }" class="Wallpaper-Item"
                @click="trySetWallpaper(wallpaper, $event)"
              >
                <el-image :key="wallpaper.label" :src="wallpaper.wallpaper" lazy class="Wallpaper-Item-Img" />
                <!-- <img :alt="wallpaper.label" :src="wallpaper.wallpaper" class="Wallpaper-Item-Img"> -->
                <span>{{ wallpaper.label }}
                </span>
              </div>
            </div>
          </div>

          <br>
        </div>
      </el-scrollbar>
    </div>

    <div class="ProfileWrapper-Footer">
      <!-- <TextShaving text="外观自定义需要高级订阅来启用" /> -->
      <TextShaving :text="textShaving" />

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
    // margin-right: 2rem;
  }
}

.Wallpaper-Item {
  &::before {
    z-index: 1;
    content: '订阅用户专享';
    position: absolute;
    display: flex;

    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;

    top: 4px;
    right: 4px;

    height: 20px;
    width: 100px;

    opacity: 0;
    color: #000;
    font-size: 14px;
    line-height: 24px;
    border-radius: 0 8px 0 8px;
    box-shadow: -2px 2px 1px 1px var(--el-color-warning);
    background-color: var(--el-color-warning);
  }
  &.lock::before {
    opacity: 1;
  }

  .Wallpaper-Item-Img {
    // 用来防止浏览器大图插件显示图片影响点击
    &::before {
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;
    }
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
        transition: 0.25s;
      }

      &::after {
        width: 15px;

        opacity: 1;
        transition: 0.25s 0.125s;
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
      // transition: 0.25s;
    }

    &::before {
      top: 18px;
      left: 6px;

      // width: 10px;
      height: 3px;

      transform: rotate(45deg);
      transition: 0.25s 0.125s;
    }

    &::after {
      top: 15.5px;
      left: 10.5px;

      // width: 15px;
      height: 3px;

      transform: rotate(-50deg);
      transition: 0.25s;
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

    transform: translate(6.5rem, 0.125rem);
  }
}
</style>
