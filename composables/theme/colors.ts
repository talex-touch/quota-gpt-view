import Mountain from '/backgrounds/mountain.jpg'
import NightMountain from '/backgrounds/night-mountain.jpg'
import Grass from '/backgrounds/grass.jpg'
import Dessert from '/backgrounds/dessert.jpg'
import Powder from '/backgrounds/powder.jpg'
import Universe from '/backgrounds/universe.jpg'
import Golden from '/backgrounds/golden.jpg'
import Blocks from '/backgrounds/blocks.jpg'
import Earth from '/backgrounds/earth.jpg'

// import { useColorMode } from '@vueuse/core'

export const themeColors = [
  '#3AB8FD',
  '#4058F2',
  '#0FD267',
  '#EABE10',
  '#EA9E10',
  '#E91010',
  '#EA1093',
  '#CC10EA',
  '#5910EA',
  '#489FBE',
  '#09BB90',
  '#3F8FF7',
]

export const wallpapers = [
  {
    id: 'mountain',
    label: '日照雪山',
    color: '#00477B',
    wallpaper: Mountain,
  },
  {
    id: 'night-mountain',
    label: '晚霞橙森',
    color: '#60637A',
    wallpaper: NightMountain,
  },
  {
    id: 'grass',
    label: '绿茵草丛',
    color: '#606D39',
    wallpaper: Grass,
  },
  {
    id: 'dessert',
    label: '沙漠戈壁',
    color: '#B2481F',
    wallpaper: Dessert,
  },
  {
    id: 'powder',
    label: '粉野末镜',
    color: '#9186CE',
    wallpaper: Powder,
  },
  {
    id: 'universe',
    label: '星河宇宙',
    color: '#B4B1BA',
    wallpaper: Universe,
  },
  {
    id: 'golden',
    label: '灿煌云巅',
    color: '#FCCC48',
    wallpaper: Golden,
  },
  {
    id: 'blocks',
    label: '菁彩积木',
    color: '#203243',
    wallpaper: Blocks,
  },
  {
    id: 'earth',
    label: '瀚宇地球',
    color: '#4F637B',
    wallpaper: Earth,
  },
]

export const themeOptions = useLocalStorage('theme-options', {
  color: 0,
  theme: '',
})

export function setWallpaper(paper: any) {
  if (!paper) {
    themeOptions.value.theme = ''
    document.body.classList.remove('wallpaper')

    document.documentElement.style.setProperty('--wallpaper-color', '')
    document.documentElement.style.setProperty('--wallpaper-color-light', '')
    document.documentElement.style.setProperty('--wallpaper-color-lighter', '')
    document.documentElement.style.setProperty('--wallpaper', '')

    return
  }
  themeOptions.value.theme = paper.id

  document.body.classList.add('wallpaper')

  document.documentElement.style.setProperty('--wallpaper-color', paper.color)
  document.documentElement.style.setProperty('--wallpaper-color-light', `${paper.color}80`)
  document.documentElement.style.setProperty('--wallpaper-color-lighter', `${paper.color}30`)
  document.documentElement.style.setProperty('--wallpaper', `url(${paper.wallpaper})`)
}

export function viewTransition(e: { clientX: number, clientY: number }, theme?: 'auto' | 'light' | 'dark') {
  if (!document.startViewTransition)
    return

  const color = useColorMode()

  const compColorMode = computed({
    get() {
      return color.preference
    },
    set(val: string) {
      color.preference = val
    },
  })

  const transition = document.startViewTransition(() => {
    compColorMode.value = theme || (compColorMode.value === 'dark' ? 'light' : 'dark')
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
