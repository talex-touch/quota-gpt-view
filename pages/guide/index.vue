<script setup lang="ts">
import GuideAside from '~/components/guide/GuideAside.vue'
import { $endApi } from '~/composables/api/base'
import DocLayout from '~/components/chore/doc/DocLayout.vue'

definePageMeta({
  layout: 'default',
  pageTransition: {
    name: 'slide',
  },
})

const route = useRoute()
const curDoc = ref()
const documents = ref([])

function handleSelect(data: any) {
  curDoc.value = data
}

const content = ref('')
const outline = ref('')

watchEffect(() => {
  if (!curDoc.value)
    return

  const _content = curDoc.value.record?.content || ''

  outline.value = ''
  content.value = _content ? JSON.parse(decodeURI(atob(_content))) : ''
})

onMounted(async () => {
  const res: any = await $endApi.v1.cms.doc.deployedList({})

  if (res.code === 200) { documents.value = res.data.items }
  else { ElMessage.error(res.message); return }

  const query = route.query.data
  if (query)
    curDoc.value = documents.value.find((item: any) => item.title === query)
})

function handleOutLine(data: any) {
  outline.value = data
}

let _func: any
provide('onScroll', (func: any) => {
  _func = func
})

function handleScroll(e: any) {
  _func?.(e)
}
</script>

<template>
  <DocLayout>
    <div class="Guide expand">
      <div class="GuideAside">
        <ClientOnly>
          <GuideAside :data="documents" @select="handleSelect" />
        </ClientOnly>
      </div>
      <el-main>
        <div v-if="curDoc" class="GuideMain markdown-body">
          <el-scrollbar @scroll="handleScroll">
            <div class="GuideMain-Header">
              <h1>{{ curDoc.title }}</h1>
              <p>最后更新于 {{ formatDate(curDoc.updatedAt) }}</p>
            </div>
            <ArticleMilkContent :content="content" @outline="handleOutLine" />
          </el-scrollbar>
        </div>
        <ClientOnly>
          <ArticleContentOutline v-if="outline" :outline="outline" />
        </ClientOnly>
      </el-main>
    </div>
  </DocLayout>
</template>

<style lang="scss">
.GuideMain {
  &-Header {
    h1 {
      font-size: 24px;
      font-weight: 600;
    }

    p {
      opacity: 0.5;
    }

    padding: 1rem 2rem;
  }

  .el-scrollbar {
    width: 100%;
  }

  position: relative;

  flex: 1;
  width: 100%;
  height: 100%;
}

.el-main > div {
  .RenderContent {
    padding: 0 10%;
  }

  display: flex;
}

.el-main {
  > ul {
    width: 30%;
    max-width: 240px;

    border-left: 1px solid var(--el-border-color);
  }

  display: flex;
  padding: 0;

  overflow: hidden;
}

// .outline-preview {
//   width: 30%;

//   border-left: 1px solid var(--el-border-color);
// }

.Guide {
  position: absolute;
  display: flex;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.GuideAside {
  position: absolute;

  width: 200px;
  height: 100%;

  top: 0;
  left: 0;

  flex: 1;
}
</style>
