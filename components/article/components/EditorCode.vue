<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import clsx from 'clsx'

const langs = [
  'text',
  'typescript',
  'javascript',
  'html',
  'css',
  'json',
  'markdown',
]

const { contentRef, selected, node } = useNodeViewContext()

const did = ref(false)

function handleCopy() {
  navigator.clipboard.writeText(node.value.textContent)

  did.value = true

  setTimeout(() => {
    did.value = false
  }, 1000)
}

const lang = computed(() => node.value.attrs.language)
</script>

<template>
  <div class="EditorCode" :class="{ selected }">
    <div class="EditorCode-Header">
      <div class="rich-lang">
        {{ lang }}
      </div>
      <div :class="{ did }" class="rich-copy" @click="handleCopy">
        <span class="un">
          复制
        </span>
        <span class="did">已复制!</span>
      </div>
    </div>
    <div class="EditorCode-Content">
      <pre :spellcheck="false"><code :ref="contentRef" /></pre>
    </div>
  </div>
</template>

<style lang="scss">
.selected {
  outline: blue solid 1px;
}

.EditorCode {
  &-Header {
    z-index: 1;
    position: sticky;
    padding: 0 1rem;
    display: flex;

    top: 0;

    align-items: center;
    justify-content: space-between;

    width: 100%;
    height: 40px;

    border-radius: 10px;
    background-color: var(--el-bg-color-overlay);
  }

  &-Content {
    pre {
      height: 100%;
    }
    position: relative;
    padding: 0.5rem 1rem;

    border-radius: 0 0 10px 10px;
    background-color: var(--el-bg-color);
  }

  display: flex;
  margin: 1rem 0;

  flex-direction: column;

  .rich-copy .did {
    position: absolute;

    top: 0;
    right: 0;

    opacity: 0;
    transition: 0.25s;
    transform: translateX(5px);
  }

  .rich-copy .un {
    position: absolute;

    top: 0;
    right: 0;

    transition: 0.25s;
    transform: translateX(0);
  }

  .rich-copy.did .un {
    opacity: 0;
    transform: translateX(-5px);
  }

  .rich-copy.did {
    width: 60px;
  }

  .rich-copy.did .did {
    opacity: 1;
    transform: translateX(0);
  }

  .rich-copy {
    position: relative;

    width: 50px;
    height: 25px;
    line-height: 28px;

    // color: var(--el-text-color-secondary);
    opacity: 0.75;
    font-size: 14px;
    cursor: pointer;
    // overflow: hidden;
    // user-select: none;
    border-radius: 4px;
    transition: all 0.2s;
    // background-color: var(--el-color-primary-light-9);
  }

  .rich-copy:hover {
    opacity: 1;
    cursor: pointer;
  }

  .rich-lang {
    position: relative;

    opacity: 0.75;
  }
}
</style>
