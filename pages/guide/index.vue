<script setup lang="ts">
import Vditor from 'vditor'
import GuideAside from '~/components/guide/GuideAside.vue'
import { getDocList } from '~/composables/api/doc'

definePageMeta({
  layout: 'document',
})

const curDoc = ref()
const documents = ref([])

onMounted(async () => {
  const res: any = await getDocList()

  if (res.code === 200)
    documents.value = res.data.items
  else ElMessage.error(res.message)
})

function handleSelect(data: any) {
  curDoc.value = data
}

const outline = ref()
const content = computed(() => curDoc.value ? JSON.parse(decodeURI(atob(curDoc.value.value))) : '')

// watch(() => content.value, () => {
//   nextTick(async () => {
//     const outlineDom = outline.value

//     const html = await Vditor.md2html(content.value)
//     outlineDom.innerHTML = html
//     // const el = document.querySelector('.RenderContent .RenderContent-Inner')

//     console.log('e', outlineDom)

//     Vditor.outlineRender(outlineDom, outlineDom)
//   })
// })
</script>

<template>
  <div class="Guide expand">
    <el-aside class="GuideAside" width="200px">
      <GuideAside :data="documents" @select="handleSelect" />
    </el-aside>
    <el-main>
      <div v-if="curDoc">
        <RenderContent :readonly="false" :render="{ enable: true, media: true }" :data="content" />
        <div ref="outline" class="outline-preview" />
      </div>
    </el-main>
  </div>
</template>

<style lang="scss">
.el-main > div {
  .RenderContent {
    padding: 0 10%;
  }
  display: flex;
}

.el-main {
  padding: 0;
}

.outline-preview {
  width: 30%;

  border-left: 1px solid var(--el-border-color);
}

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
