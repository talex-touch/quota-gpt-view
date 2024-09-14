<script setup lang="ts">

import { ref } from 'vue';

//逻辑
//前端反馈类型还是由后端传过来，前端只渲染，






export interface FeedBackForm {

  allRate: number;
  feedType: string;
  feedDesc: string;
  feedSuggestion: string;
}



const form = ref<FeedBackForm>({
  allRate: 0,
  feedType: '',
  feedDesc: '',
  feedSuggestion: ''
});


import { $endApi } from "../composables/api/base/index"














const showDetails = ref(false)

//整体评价：
const rateText = ['0', 'disappointed', 'normal', 'good', 'great']

//切换显示反馈分数下面的内容
function toggleDetails() {
  showDetails.value = !showDetails.value;
  // 确保 DOM 更新完成后进行操
  nextTick(() => {
    // 重新计算高度
    let el = document.getElementById('feedbackFormbox')!;
    el!.style.height = ''
    // 如果显示详情，则设置新的高度
    if (showDetails.value) {
      el.style.height = `${125 + el.scrollHeight}px`;
    }
  });
}







// 立即执行函数并赋值给 feedbackTypesArray
const types: { type: string, value: string }[] = [
  {
    type: 'bug',
    value: '界面优化'
  },
  {
    type: 'feature',
    value: '功能建议'
  },
  {
    type: 'other',
    value: '其他'
  }

];
const feedbackTypesArray = reactive(createFeedbackTypes(types));




//点击标签，生产不同标签
function FeedTypeClick(index: number) {
  form.value.feedType = feedbackTypesArray[index].type;

  feedbackTypesArray.forEach((item, idx) => {

    item.isSelected = idx === index;
    console.log("======= item.isSelected =======\n", item.isSelected);
  });
  console.log("======= feedbackTypesArray =======\n", feedbackTypesArray);


}



watch(() => form.value.feedSuggestion, (newval) => {
  nextTick(() => {

    if (newval.length > 0) {
      // 显示按钮
      let el = document.getElementById('feedbackFormbox')!;
      el!.style.height = ''
      // 如果显示详情，则设置新的高度
      if (showDetails.value) {
        el.style.height = `${el.scrollHeight}px`;
      }
      console.log("======= el.style.height =======\n", el.style.height);
    }
  })
})

watch(() => form.value.feedDesc, (newval) => {
  nextTick(() => {

    if (newval.length > 0) {
      // 显示按钮
      let el = document.getElementById('feedbackFormbox')!;
      el!.style.height = ''
      // 如果显示详情，则设置新的高度
      if (showDetails.value) {
        el.style.height = `${el.scrollHeight}px`;
      }
      console.log("======= el.style.height =======\n", el.style.height);
    }
  })
})





/**
 * 传类型对象生成对象数组
 * 
 * @param types 
 */
function createFeedbackTypes(types: { type: string, value: string }[]): { isSelected: boolean, type: string, value: string }[] {
  const feedbackTypesArray: { isSelected: boolean, type: string, value: string }[] = [];



  types.forEach((item) => {
    feedbackTypesArray.push({
      isSelected: false,
      type: item.type,
      value: item.value
    });

  });

  return feedbackTypesArray;
}







// 传递给父组件的事件
const emit = defineEmits(['close']);

async function submitFeedback() {
  console.log('提交的反馈:', form.value);
  // 清空历史记录





  const res = await $endApi.v1.common.Feedback.create!(form.value)

  if (res.code === 200) {
    ElMessage.success("反馈成功！,感谢")
    form.value = {
      allRate: 0,
      feedType: '',
      feedDesc: '',
      feedSuggestion: ''
    }


    // 关闭反馈表单
    emit('close');
  }


}

</script>

<template>

  <div id="feedbackFormbox" class="feedback">


    <div class="title">给我们个反馈吧！</div>
    <el-form :model="form" class="feedback-form">
      <el-form-item label="整体评价：" label-position="top">
        <div style="width: 100%;" class="stars" @click="toggleDetails">
          <el-rate v-model="form.allRate" :texts="rateText" show-text />
        </div>
      </el-form-item>

      <div v-if="showDetails">
        <el-form-item style="width: 100%;" label="反馈类型：" label-position="top">
          <div style="width: 100%;" class="feedback-type">
            <el-tag :type="item.isSelected ? 'primary' : 'info'" @click="FeedTypeClick(index)"
              v-for="(item, index) in feedbackTypesArray">
              {{
                item.value }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item style="width: 100%;" label="反馈描述：" label-position="top">
          <el-input class="input" style="width: 100%;" v-model="form.feedDesc" :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea" placeholder="帮我们写点描述吧！" />
        </el-form-item>

        <el-form-item class="input" style="width: 100%;" label="改进建议：" label-position="top">

          <el-input style="width: 100%; overflow: hidden;" v-model="form.feedSuggestion"
            :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="帮我们写点建议把！" />
        </el-form-item>
      </div>

    </el-form>


    <el-button style="margin-bottom: 20px;" v-if="showDetails" @click="submitFeedback" type="primary">提交反馈</el-button>
  </div>



</template>

<style scoped>
.el-form {
  --el-font-size-base: 18px;
  --el-form-label-font-size: 18px;
}



.feedback {
  position: absolute;
  padding: 1rem 2rem;
  z-index: 10;

  right: 1rem;
  bottom: 1rem;

  width: 500px;
  height: 125px;


  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;





  .title {
    width: 100%;
    text-align: left;
    font-size: larger;
    padding-bottom: 1rem;
  }




  .feedback-type {
    width: 100%;
    cursor: pointer;

    display: flex;
    gap: 10px;

  }

  .feedback-form {
    width: 100%;
    height: 100%;
  }

  overflow: hidden;
  transition: height 0.25s;

  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color)
}
</style>
