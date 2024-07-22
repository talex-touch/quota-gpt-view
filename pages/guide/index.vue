<script setup lang="ts">
import GuideAside from '~/components/guide/GuideAside.vue'
import { getDocList } from '~/composables/api/doc'

definePageMeta({
  layout: 'document',
})

const documents = ref([])

onMounted(async () => {
  const res: any = await getDocList()

  if (res.code === 200)
    documents.value = res.data.items
  else ElMessage.error(res.message)

  console.log(documents.value)
})
</script>

<template>
  <div class="Guide expand">
    <el-aside class="GuideAside" width="200px">
      <GuideAside :data="documents" />
    </el-aside>
    <el-main>
      <div>
        1
      </div>
    </el-main>
  </div>
</template>

<style lang="scss">
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
