<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  loading: boolean
  footer?: boolean
}>()

const emits = defineEmits(['update:modelValue'])

const visible = useVModel(props, 'modelValue', emits)

const dialogOptions = reactive({
  forbidden: false,
})

async function handleClickOutside() {
  dialogOptions.forbidden = true

  await sleep(100)

  dialogOptions.forbidden = false
}
</script>

<template>
  <teleport to="#teleports">
    <div
      :class="{ visible, forbidden: dialogOptions.forbidden, loading }" class="TouchDialog"
      @click="handleClickOutside"
    >
      <div class="TouchDialog-Main Main" @click.stop="">
        <div class="TouchDialog-Close" @click="visible = false">
          <div i-carbon:close />
        </div>

        <div class="TouchDialog-Title">
          <slot name="Title" />
        </div>

        <div class="TouchDialog-Content">
          <slot />
        </div>

        <div v-if="footer" class="TouchDialog-Footer">
          <slot name="Footer" />
        </div>
      </div>

      <div class="TouchDialog-Main Loading" @click.stop="">
        <ChoreLogo class="Logo" />
        <span class="text">准备中...</span>
        <IconCircleLoader class="Loader" />
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
.TouchDialog-Main.Loading {
  .loading & {
    .Logo {
      left: 10%;

      transition: 0.35s 0.5s;
    }

    .text {
      opacity: 1;

      transition: 0.5s 0.75s;
    }

    .Loader {
      opacity: 1;

      transform: scale(0.75);
      transition: 0.5s 0.75s;
    }

    transform: translate(-50%, -50%) scale(1);
  }

  .Loader {
    position: absolute;

    right: calc(10% - 12px);

    opacity: 0;
    transition: cubic-bezier(0.6, -0.28, 0.735, 0.045) 0.35s;
  }

  .Logo {
    position: absolute;

    top: 50%;
    left: 50%;

    transform: translate(-50%, -50%);
    transition: 0.25s;
  }

  .text {
    position: absolute;

    top: 50%;
    left: 50%;

    opacity: 0;
    transform: translate(-50%, -50%);
    transition: 0.25s;
  }

  transform: translate(-50%, -50%) scale(0);
  transition: cubic-bezier(0.6, -0.28, 0.735, 0.045) 0.25s;
}

.TouchDialog-Main {
  &.Main {
    .visible & {
      pointer-events: auto;
    }

    .loading & {
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, -50%) scale(1.05);

      transition: 0.35s;
    }

    .TouchDialog-Title {
      padding: 1.5rem;
      display: flex;

      gap: 0.5rem;
      align-items: center;

      font-size: 20px;

      width: 100%;

      border-bottom: 1px solid var(--el-border-color);
    }

    .TouchDialog-Content {
      padding: 1rem;
      display: flex;

      flex-direction: column;
      gap: 0.5rem;

      max-width: 100%;
      max-height: 80%;
    }

    .TouchDialog-Footer {
      display: flex;
      padding: 1rem;

      width: 100%;

      justify-content: flex-end;

      border-top: 1px solid var(--el-border-color);
    }

    display: flex;

    flex-direction: column;

    opacity: 1;
    transition: 0.35s 0.25s;
    transform: translate(-50%, -50%) scale(1);
  }

  max-height: calc(100% - 48px);
  width: auto;
  min-width: max(280px, 10%);
  max-width: calc(100% - 48px);
  height: auto;

  margin: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 60px;
  position: absolute;
  contain: layout;

  top: 50%;
  left: 50%;

  box-sizing: border-box;
  transform: translate(-50%, -50%) scale(0);

  transition: 0.125s;
  border-radius: 16px;
  pointer-events: none;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
}

.TouchDialog {
  &.visible {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  &.forbidden {
    transform: scale(1.025);
  }

  z-index: 10000;
  position: absolute;

  width: 100%;
  height: 100%;

  opacity: 0;
  transition: 0.25s;
  pointer-events: none;
  transform: scale(1.05);
  background-color: var(--el-overlay-color-lighter);
}

.TouchDialog-Close {
  &:hover {
    color: var(--el-color-danger);
  }

  z-index: 1;
  position: absolute;
  display: flex;

  top: 0;
  right: 0;

  width: 24px;
  height: 24px;

  cursor: pointer;

  align-items: center;
  justify-content: center;

  border-radius: 50%;
  transform: translate(50%, -50%);
  background-color: var(--el-bg-color);
}
</style>
