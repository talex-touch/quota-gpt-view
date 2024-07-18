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

export const EndUrl = window?.process?.dev ? `http://localhost:7001/api` : `https://quota.api.tagzxia.com/api`
export const EndNormalUrl = window?.process?.dev ? `http://localhost:7001` : `https://quota.api.tagzxia.com/`
