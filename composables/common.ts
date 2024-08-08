import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import gsap from 'gsap'

dayjs.extend(duration)

export function genFormatDate(date: Date) {
  // now date: YYYY/M/D HH:mm:ss
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

export function genFormatNowDate() {
  return genFormatDate(new Date())
}

export async function sleep(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function getLastTextNode(node: HTMLElement): HTMLElement | null {
  if (node.nodeType === Node.TEXT_NODE)
    return node

  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const childNode = node.childNodes[i]
    const lastTextNode = getLastTextNode(childNode as HTMLElement)
    if (lastTextNode)
      return lastTextNode
  }

  return null
}

export function formatDate(date: any, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format)
}

export function formatDuration(duration: number, format: string = 'HH:mm:ss') {
  return dayjs.duration(duration, 'milliseconds').format(format)
}

export function genGsapNumber(number = 0, duration = 0.5) {
  const obj = reactive({
    number,
    tweened: 0,
  })
  watch(() => obj.number, () => {
    gsap.to(
      obj,
      {
        duration,
        tweened: Number(obj.number) || 0,
      },
    )
  })
  return obj
}

export function _T_DecodeNumber(str: string, addonSecret: number = 0): number {
  return Number.parseInt(String(str2number(str)), 8) - addonSecret
}

export function _T_EncodeNumber(number: number, randomAddon: number = 0): string {
  return number2str(Number((number + randomAddon).toString(8)))
}

export function str2number(str: string): number {
  const mapper = 'VTFCPOGMX*'

  let _str = ''
  for (const letter of [...str]) _str += mapper.indexOf(letter.toUpperCase())

  return Number(_str)
}

export function number2str(number: number): string {
  const mapper = 'VTFCPOGMX'

  let str = ''
  for (const letter of [...String(number)]) {
    const char = mapper.at(Number(letter)) || '*'
    str += Math.random() > 0.5 ? char.toLowerCase() : char
  }

  return str
}
