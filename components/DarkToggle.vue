<script setup lang="ts">
const color = useColorMode()

useHead({
  meta: [
    {
      id: 'theme-color',
      name: 'theme-color',
      content: () => (color.value === 'dark' ? '#222222' : '#ffffff'),
    },
  ],
})

function viewTransition(e: { clientX: number, clientY: number }) {
  if (!document.startViewTransition)
    return

  const transition = document.startViewTransition(() => {
    color.preference = color.value === 'dark' ? 'light' : 'dark'

    document.body.classList.toggle('dark', color.value === 'dark')
  })

  transition.ready.then(() => {
    const { clientX, clientY } = e

    const radius = Math.hypot(
      Math.max(clientX, innerWidth - clientX),
      Math.max(clientY, innerHeight - clientY),
    )
    const clipPath = [
      `circle(0% at ${clientX}px ${clientY}px)`,
      `circle(${radius}px at ${clientX}px ${clientY}px)`,
    ]
    const isDark = document.documentElement.classList.contains('dark')

    document.documentElement.animate(
      {
        clipPath: isDark ? clipPath.reverse() : clipPath,
      },
      {
        duration: 500,
        pseudoElement: isDark
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}
</script>

<template>
  <button class="!outline-none" @click="viewTransition">
    <div class="i-carbon-sun dark:i-carbon-moon" />
  </button>
</template>

<style>
::view-transition-new(root),
::view-transition-old(root) {
  animation: none;
}

.dark::view-transition-old(root) {
  z-index: 100;
}
</style>
