/*
 * Copyright (c) 2024. TalexDreamSoul
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, { type CreateAxiosDefaults } from 'axios'
import type { IStandardResponse } from './base/index.type'
import { globalOptions } from '~/constants'

const refreshOptions: {
  pending: boolean
  queue: {
    resolve: (value: any) => void
    reject: (value: any) => void
    reqConfig: any
  }[]
} = {
  pending: false,
  queue: [],
}

export function genAxios(options: CreateAxiosDefaults) {
  const $http = axios.create(options)

  $http.interceptors.request.use(
    (originConfig) => {
      const reqConfig = { ...originConfig }
      if (!reqConfig.url)
        console.error('Request url must not be null.')

      const method = String(reqConfig?.method).toUpperCase()

      if (method === 'POST') {
        if (!reqConfig.data)
          reqConfig.data = reqConfig.params || {}

        let hasFile = false
        Object.keys(reqConfig.data).forEach((key) => {
          typeof reqConfig.data[key] === 'object' && (
            item => (item instanceof FileList || item instanceof File || item instanceof Blob) ? hasFile = true : 0
          )(reqConfig.data[key])
        })

        hasFile && ((data) => {
          const formData = new FormData()

          Object.keys(data).forEach(key => formData.append('file', data[key]))

          reqConfig.data = formData

          // console.log("File", formData)
        })(reqConfig.data)
      }

      if (userStore.value.isLogin)
        reqConfig.headers.Authorization = `Bearer ${userStore.value.token?.accessToken}`

      // if (refreshOptions.pending) {
      //   return new Promise((resolve, reject) => {
      //     refreshOptions.queue.push({ resolve, reject, reqConfig })
      //   })
      // }
      if (!refreshOptions.pending) {
        if (refreshOptions.queue.length > 0) {
          console.log('process queue', refreshOptions)
          refreshOptions.queue.forEach((item) => {
            $http(item.reqConfig).then(item.resolve).catch(item.reject)
          })

          refreshOptions.queue.length = 0
        }
      }

      return reqConfig
    },
    error => Promise.reject(error),
  )

  async function timeoutLogout() {
    $handleUserLogout()

    const { origin } = window.location
    window.location.href = origin

    ElMessage.info({
      message: '登录超时，请重新登录!',
      grouping: true,
    })
  }

  $http.interceptors.response.use(
    async (res: any) => {
      if (res.data?.code === 1101)
        return timeoutLogout()

      return res.data
    },
    async (res) => {
      console.error(res)

      if (!res.response || res.code === 'ERR_INTERNET_DISCONNECTED') {
        return ElMessage.error({
          message: '无法连接至远程服务器!',
          grouping: true,
        })
      }

      if (res.code === 'ERR_NETWORK' && (res.message.includes('timeout') || res.message === 'Network Error'))
        return ElMessage.error('请检查您的网络!')

      if (res.response.data.code === 429)
        return ElMessage.error(res.response.data.message)

      if (res.response.data?.code === 401) {
        // refresh
        const { config } = res

        // url不包含 renew_token
        if (!config.url.includes('renew_token')) {
          if (!refreshOptions.pending) {
            console.log('renew token')

            refreshOptions.pending = true

            const res: any = await $http({
              method: 'GET',
              url: 'auth/renew_token',
              data: {
                refresh_token: userStore.value.token?.refreshToken,
              },
            })

            console.log('renew', res.data)
            refreshOptions.pending = false
            if (res.code === 200) {
              userStore.value.token = res.data

              return $http(config)
            }
            else {
              return timeoutLogout()
            }
          }
          else {
            return new Promise((resolve, reject) => {
              refreshOptions.queue.push({ resolve, reject, reqConfig: config })
            })
          }
        }
        else {
          return timeoutLogout()
        }
      }

      return res.response.data
    },
  )

  // 导出常用函数

  /**
   * @param {string} url
   * @param {object} data
   * @param {object} params
   */
  function post(url: string, data = {}, params = {}) {
    return $http({
      method: 'POST',
      url,
      data,
      params,
    }) as Promise<IStandardResponse>
  }

  function get(url: string, params = {}) {
    return $http({
      method: 'GET',
      url,
      params,
    }) as Promise<IStandardResponse>
  }

  function put(url: string, data = {}, params = {}) {
    return $http({
      method: 'PUT',
      url,
      data,
      params,
    }) as Promise<IStandardResponse>
  }

  function del(url: string, data = {}, params = {}) {
    return $http({
      method: 'DELETE',
      url,
      data,
      params,
    }) as Promise<IStandardResponse>
  }

  function patch(url: string, data = {}, params = {}) {
    return $http({
      method: 'PATCH',
      url,
      data,
      params,
    }) as Promise<IStandardResponse>
  }

  // declare module 'axios' {
  //   export interface AxiosRequestConfig {
  //     hideError?: boolean
  //   }
  // }

  return {
    $http,
    post,
    get,
    put,
    del,
    patch,
    timeoutLogout,
  }
}

export const endHttp = genAxios({
  baseURL: `${globalOptions.getEndsUrl()}api`,
})
