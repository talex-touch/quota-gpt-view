<script lang="ts" setup>
import { $endApi } from '~/composables/api/base'
import type { IStandardPageModel } from '~/composables/api/base/index.type'
import { globalOptions } from '~/constants'

const done = ref(false)
// const loader = ref<HTMLElement>()
const items = reactive<any>({
  items: [],
  hotList: [],
  tagList: [],
  tagSelected: -1,
  meta: {
    currentPage: -1,
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
  },
})

const query = ref('')

async function fetchData() {
  items.meta.currentPage += 1

  const res = await $endApi.v1.aigc.searchPromptTemplate(items.meta.currentPage)

  if (res.data.items.length > 0) {
    items.items.push(...res.data.items)

    items.items = [...items.items]

    const meta = res.data.meta
    if (meta.itemCount < meta.itemsPerPage)
      done.value = true
  }
}

onMounted(async () => {
  items.hotList = await $endApi.v1.aigc.getHostList()

  const tagRes = await $endApi.v1.aigc.recommendTags()

  if (tagRes.code === 200) {
    items.tagList = [{ name: '全部', id: -1 }, ...tagRes.data.items]
  }
  else {
    ElMessage({
      message: '无法搜索模板！',
      grouping: true,
      type: 'error',
      plain: true,
    })
  }
})
</script>

<template>
  <div class="PromptRole">
    <div class="PromptRole-Header fake-background">
      <div class="PromptRole-Header-Title">
        角色列表
      </div>
    </div>

    <div class="PromptRole-MainVice">
      <el-input v-model="query" placeholder="搜索角色名称或描述...">
        <template #prefix>
          <div i-carbon:search />
        </template>
      </el-input>
      <div class="PromptRole-MainVice-Tags">
        <span v-for="tag in items.tagList" :key="tag.id" :class="{ active: tag.id === items.tagSelected }" class="tag-item" @click="items.tagSelected = tag.id">
          {{ tag.name }}
        </span>
      </div>
    </div>

    <div class="PromptRole-Main">
      <!-- {{ items.items }} -->
      <el-scrollbar>
        <masonry-wall :items="items.items" :column-width="300" :gap="24">
          <template #default="{ item }">
            <div class="PromptRole-Item">
              <img :src="`${globalOptions.getEndsUrl()}${item.avatar}`" :alt="item.title">

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

        <br v-for="i in 4" :key="i">
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss">
.PromptRole-MainVice-Tags {
  span {
    &.active::before {
      transform: scaleX(1);
    }

    &::before {
      content: '';
      position: absolute;

      width: 100%;
      height: 2px;

      left: 0;
      bottom: 0;

      border-radius: 4px;
      transform: scaleX(0);
      background-color: var(--theme-color);
      transition: 0.25s cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    position: relative;
    padding: 0.25rem 0.5rem;

    cursor: pointer;
    color: var(--el-text-color-regular);
  }
  display: flex;

  gap: 0.25rem;

  justify-content: center;
}

.PromptRole-MainVice {
  .el-input {
    width: 320px;
  }

  display: flex;
  margin: 1rem auto;

  width: 600px;
  max-width: 85%;

  gap: 0.5rem;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

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
