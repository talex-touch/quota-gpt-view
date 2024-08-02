import dayjs from 'dayjs'

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
