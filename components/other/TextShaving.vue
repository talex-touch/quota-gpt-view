<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const dom = ref()
const _text = ref('')

watch(
  () => props.text,
  (text) => {
    nextTick(async () => {
      if (!_text.value)
        return (_text.value = text)

      dom.value.style.filter = 'blur(5px)'
      dom.value.style.opacity = '0.75'

      await sleep(500)

      _text.value = text

      dom.value.style.filter = 'blur(0)'
      dom.value.style.opacity = '1'
    })
  },
  { immediate: true },
)
</script>

<template>
  <div ref="dom" class="TextShaving">
    <span class="display">{{ _text }}</span>
    <span class="flow">{{ _text }}</span>
  </div>
</template>

<style style="scss">
.TextShaving {
  .flow {
    position: absolute;

    top: 0;
    left: 0;

    opacity: 0.125;
  }
  position: relative;
  overflow: hidden;

  transition: 0.25s;
}

.TextShaving span.display {
  position: relative;

  background: radial-gradient(circle, #0000 0%, var(--el-bg-color) 90%);

  background-size: 400% 200%;

  /* background: linear-gradient(90deg, #0000 0%, var(--el-bg-color) 90%);
  background-size: 200% 100%; */
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  filter: invert(1);
  animation: TextShaving 8s linear infinite;
}

/* .TextShaving span:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 50%
  );
  animation: TextShaving 2s linear infinite;
} */

@keyframes TextShaving {
  0%,
  100% {
    background-position: 400% 0;
  }

  50% {
    background-position: 0 0;
  }
}
</style>
