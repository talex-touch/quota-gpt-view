<script setup lang="ts">
import GuideAside from '~/components/guide/GuideAside.vue'
import { getDocList } from '~/composables/api/doc'

definePageMeta({
  layout: 'document',
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

  outline.value = ''
  content.value = JSON.parse(decodeURI(atob(curDoc.value.value)))
})

onMounted(async () => {
  const res: any = await getDocList()

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
  <div class="Guide expand">
    <el-aside class="GuideAside" width="200px">
      <ClientOnly>
        <GuideAside :data="documents" @select="handleSelect" />
      </ClientOnly>
    </el-aside>
    <el-main>
      <ClientOnly>
        <!-- <div v-if="curDoc"> -->
        <!-- {{ content }} -->
        <div class="GuideMain markdown-body">
          <el-scrollbar @scroll="handleScroll">
            <ArticleMilkContent :content="content" @outline="handleOutLine" />
          </el-scrollbar>
        </div>
        <!-- <div ref="outline" class="outline-preview"> -->
        <ArticleContentOutline v-if="outline" :outline="outline" />
        <!-- </div> -->
        <!-- </div> -->
      </ClientOnly>
    </el-main>
  </div>
</template>

<style lang="scss">
.GuideMain {
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
  ul {
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

  top: 61px;
  left: 0;

  width: 100%;
  height: calc(100% - 61px);
}

.GuideAside {
  height: 100%;

  align-self: flex-start;
}
</style>
