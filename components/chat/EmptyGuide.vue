<script setup lang="ts">
defineProps<{
  show: boolean
}>()

const sections = reactive([
  {
    title: '数学专家',
    desc:
      '是人工智能领域的专业人士，具有深厚的数学知识和技能。他们运用数学原理和算法解决复杂的机器学习和数据分析问题，推动人工智能技术的发展和应用。在科研机构、高校或科技公司工作，致力于创新和推动人工智能技术。',
  },
  {
    title: '数学专家',
    desc:
      '是人工智能领域的专业人士，具有深厚的数学知识和技能。他们运用数学原理和算法解决复杂的机器学习和数据分析问题，推动人工智能技术的发展和应用。在科研机构、高校或科技公司工作，致力于创新和推动人工智能技术。',
  },
  {
    title: '数学专家',
    desc:
      '是人工智能领域的专业人士，具有深厚的数学知识和技能。他们运用数学原理和算法解决复杂的机器学习和数据分析问题，推动人工智能技术的发展和应用。在科研机构、高校或科技公司工作，致力于创新和推动人工智能技术。',
  },
])
</script>

<template>
  <div :class="{ show }" class="EmptyGuide">
    <h1 text-16 font-bold>
      This!&nbsp;<span class="ai-underline">AI</span>.
    </h1>
    <p>现在就试试下面的功能</p>

    <div class="EmptyGuide-Section">
      <div v-for="item in sections" :key="item.title" class="EmptyGuide-Section-Item">
        <p>{{ item.title }}</p>
        <span>{{ item.desc }}</span>
      </div>
    </div>

    <p relative top-16>
      在你喜欢之中，万里挑一
    </p>
  </div>
</template>

<style lang="scss">
.EmptyGuide-Section {
  &-Item {
    p {
      font-size: 22px;

      font-weight: bold;
    }
    &:hover {
      cursor: pointer;

      transform: scale(1.0125);
      box-shadow: var(--el-box-shadow);
      background-color: var(--el-bg-color-page);
    }
    padding: 0.75rem;

    min-width: 280px;
    max-width: 380px;

    text-align: left;
    transition: 0.25s;
    border-radius: 16px;
    background-color: var(--el-bg-color);
  }
  display: flex;
  margin-top: 1rem;

  gap: 1rem;

  justify-content: center;
}

@media (max-width: 768px) {
  .EmptyGuide-Section-Item span {
    display: none;
  }

  .EmptyGuide-Section {
    flex-wrap: wrap;
  }
}

.EmptyGuide {
  &.show {
    h1 {
      opacity: 0.25;
      filter: grayscale(100%);
    }
    top: 60%;

    transform: translate(-50%, -50%);
    .EmptyGuide-Section,
    p {
      opacity: 0;
    }

    pointer-events: none;
  }

  h1 {
    .ai-underline {
      &::before {
        content: '';
        position: absolute;

        bottom: 8px;

        width: 100%;
        height: 5px;

        border-radius: 16px;
        background-color: var(--el-color-primary);
      }
      position: relative;

      top: -5px;
      font-size: 3.75rem;
    }

    transition: 0.25s;
  }
  z-index: 1;
  position: absolute;
  padding: 0.5rem;

  top: 20%;
  left: 50%;

  text-align: center;
  transition: 0.25s;
  border-radius: 16px;
  transform: translate(-50%, 0);
}
</style>
