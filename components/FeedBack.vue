<script setup>
import { ref } from 'vue'

const showDetails = ref(false)

function toggleDetails() {
  showDetails.value = !showDetails.value
}

const form = ref({
  starRating: 3.5,
  feedbackDesc: '',
  feedbackSuggestion: '',
})
</script>

<template>
  <div class="feedback-form" :class="{ expand: showDetails }">
    <!--
    <button @click="toggleDetails">
      <span v-if="showDetails">收起</span>
      <span v-else>展开</span>
    </button> -->

    <el-form :mode="form" style="max-width: 600px">
      <el-form-item label="整体评价:" label-position="top">
        <div class="stars" @click="toggleDetails">
          <!-- <el-rate v-model="form.starRating"/> -->
          <el-rate v-model="form.starRating" show-score text-color="#ff9900" score-template="{value} points" />
        </div>
      </el-form-item>

      <div v-if="showDetails">
        <el-form-item label="反馈类型:" label-position="top">
          <div>
            <!-- <button type="primary" v-for="(type, index) in ['bug', 'fature', 'Other']" @click="FeedType(type)">{{ type }} -->
            <button />
          </div>
        </el-form-item>

        <el-form-item label="反馈描述:" label-position="top">
          <textarea v-model="form.feedbackDesc" />
        </el-form-item>

        <el-form-item label="?改进建议" label-position="top">
          <textarea v-model="form.feedbackSuggestion" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<style>
.box {
  display: flex;
  justify-content: center;
}

.jj {
  background-color: aqua;
}

.feedback-form {
  position: absolute;
  padding: 1rem 2rem;
  z-index: 10;

  /* right: 1rem;
  bottom: 1rem; */

  width: 600px;
  height: 100px;

  &.expand {
    height: 500px;
  }

  overflow: hidden;
  transition: 0.25s;

  border-radius: 16px;

  display: flex;
  justify-content: center;

  background-color: yellow;
  /* box-shadow: var(-- el-box-shadow);
  background-color: var(-- el-bg-color) */
}
</style>
