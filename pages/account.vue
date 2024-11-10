<script setup lang="ts">
import Account from '~/components/chore/personal/profile/Account.vue'
</script>

<template>
  <div class="AccountPage">
    <div class="page-title">
      账号设置
    </div>

    <Account />
  </div>
</template>

<style lang="scss">
.AccountPage {
  position: relative;
  padding: 0.5rem;

  width: 100%;
  height: 100%;

  > div.page-title {
    margin: 0 auto;

    font-size: 22px;
    font-weight: 600;

    animation: fadeJoin 0.25s;
  }

  .el-button {
    border-radius: 12px;
  }
}

.ProfileAccount-Box-Data {
  .box-data {
    &:hover {
      background-color: var(--el-fill-color-lighter);
    }

    .title {
      display: flex;

      align-items: center;
      justify-content: space-between;
      color: var(--el-text-color-secondary);
    }

    > p {
      font-size: 14px;
      margin-top: 1rem;
    }

    padding: 1rem;
    display: flex;

    flex: 1;

    cursor: pointer;
    border-radius: 16px;
    flex-direction: column;
    border: 1px solid var(--el-border-color);
  }

  display: flex;
  margin: 1rem 0;

  gap: 0.5rem;
  justify-content: space-between;
}

.ProfileAccount-Box {
  position: relative;
  margin: 1rem auto;

  width: 720px;
  max-width: 85%;

  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--el-border-color);

  opacity: 0;
  animation: fadeJoin 0.25s var(--d, 0s) forwards;

  &-Header {
    div.image {
      width: 32px;
      height: 32px;

      border-radius: 18px;
      background-color: var(--el-border-color);
    }

    padding: 0.5rem;

    border-bottom: 1px solid var(--el-border-color);
  }

  &-Main {
    .template-normal {
      div.image {
        width: 64px;
        height: 64px;

        border-radius: 50%;
        background-color: var(--el-border-color);
      }

      div.title {
        font-size: 20px;
      }

      p.subtitle {
        font-size: 14px;
      }
    }

    padding: 0.5rem;
  }

  &-Footer {
    display: flex;
    padding: 0.5rem;

    justify-content: flex-end;
  }
}

@keyframes fadeJoin {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(15%);
  }

  99% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  100% {
    opacity: unset;
    transform: unset;
  }
}
</style>
