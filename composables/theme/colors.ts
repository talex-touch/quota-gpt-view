import Mountain from '/backgrounds/mountain.jpg'
import NightMountain from '/backgrounds/night-mountain.jpg'
import Grass from '/backgrounds/grass.jpg'
import Dessert from '/backgrounds/dessert.jpg'
import Powder from '/backgrounds/powder.jpg'
import Universe from '/backgrounds/universe.jpg'

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
]

export const themeOptions = useLocalStorage('theme-options', {
  color: 0,
  theme: '',
})

export function setWallpaper(paper: any) {
  themeOptions.value.theme = paper.id

  document.body.classList.add('wallpaper')

  document.documentElement.style.setProperty('--wallpaper-color', paper.color)
  document.documentElement.style.setProperty('--wallpaper-color-light', `${paper.color}80`)
  document.documentElement.style.setProperty('--wallpaper-color-lighter', `${paper.color}30`)
  document.documentElement.style.setProperty('--wallpaper', `url(${paper.wallpaper})`)
}
