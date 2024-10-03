<script lang="ts" setup>
import { $endApi } from '~/composables/api/base'
import type { IStandardPageModel } from '~/composables/api/base/index.type'
import { globalOptions } from '~/constants'

const done = ref(false)
const loader = ref<HTMLElement>()
const items = reactive<IStandardPageModel<any>>({
  items: [],
  meta: {
    currentPage: -1,
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
  },
})

async function fetchData() {
  items.meta.currentPage += 1

  const res = await $endApi.v1.aigc.getPrompt(items.meta.currentPage)

  if (res.data.items.length > 0) {
    items.items.push(...res.data.items)

    items.items = [...items.items]
  }
  else { done.value = true }
}

onMounted(() => {
  const el = loader.value!

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting)
      fetchData()
  }, {
    threshold: 0,
  })

  if (el instanceof Element)
    observer.observe(el)

  watch(() => done.value, () => {
    if (done.value)
      observer.unobserve(el)
  })
})
</script>

<template>
  <div class="PromptRole">
    <div class="PromptRole-Header fake-background">
      <div class="PromptRole-Header-Title">
        角色列表
      </div>
    </div>

    <div class="PromptRole-Main">
      <!-- {{ items.items }} -->
      <el-scrollbar>
        <masonry-wall :items="items.items" :column-width="300" :gap="24">
          <template #default="{ item }">
            <div class="PromptRole-Item">
              <img :src="`${globalOptions.getEndsUrl()}${item.avatar}`" :alt="item.title">

              <!-- <el-img :src="`${globalOptions.getEndsUrl()}${item.avatar}`" :alt="item.title">
                <template #placeholder>
                  <el-skeleton :rows="2" animated />
                </template>

                <template #error>
                  <OtherTextShaving text="无法加载图片" />
                </template>
              </el-img> -->

              <div my-2 class="PromptRole-Footer">
                <p flex items-center justify-between gap-2>
                  <span class="title">{{ item.title }}</span>
                  <span flex cursor-pointer items-center gap-1 class="func">
                    <i i-carbon:favorite block />
                    0
                  </span>
                </p>

                <p>
                  {{ item.description }}
                </p>
              </div>
            </div>
          </template>
        </masonry-wall>

        <div ref="loader" class="PromptRole-Loader">
          <LoadersEagleRoundLoading v-if="!done" />
          <p v-else>
            仿佛来到了没有知识的荒漠.
          </p>
        </div>

        <br v-for="i in 4" :key="i">
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss">
.PromptRole-Loader {
  position: relative;

  margin: 2rem auto;

  width: max-content;

  opacity: 0.75;
  font-size: 1rem;
}

.PromptRole-Footer {
  span.title {
    font-weight: 600;
    font-size: 1.05rem;
  }
  padding: 0 1rem;

  display: flex;

  gap: 0.5rem;
  flex-direction: column;
}

.PromptRole-Item {
  img {
    min-width: 100%;

    border-radius: 12px;
    border: 1px solid var(--el-border-color);
  }
  padding: 0.5rem;

  // box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
}

.PromptRole {
  &-Main {
    .masonry-wall {
      margin: 0 auto;

      max-width: 1280px;
    }
    position: relative;
    padding: 1rem;

    height: calc(100% - 64px);
  }
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  .PromptRole-Header {
    position: sticky;
    padding: 0 16px;

    top: calc(0 - var(--el-main-padding));

    height: 64px;

    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(18px) saturate(180%);

    .PromptRole-Header-Title {
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
