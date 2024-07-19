/*
 * Copyright (c) 2022. TalexDreamSoul
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
import { EndNormalUrl } from '~/constants'

export function genAxios(options: CreateAxiosDefaults) {
  const $http = axios.create(options)

  $http.interceptors.request.use(
    (originConfig) => {
      const reqConfig = { ...originConfig }
      if (!reqConfig.url)
        console.error('Request url must not be null.')

      const method = String(reqConfig?.method).toUpperCase()

      if (method === 'GET' && !reqConfig.params)
        reqConfig.params = reqConfig.data || {}

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

      if (userStore.value.token)
        reqConfig.headers.Authorization = `Bearer ${userStore.value.token}`

      return reqConfig
    },
    error => Promise.reject(error),
  )

  async function timeoutLogout() {
    userStore.value.token = ''

    const { origin } = window.location
    window.location.href = origin

    ElMessage.info('登录超时，请重新登录!')
  }

  $http.interceptors.response.use(
    async (res: any) => {
      return res.data
    },
    async (res) => {
      if (!res.response || res.code === 'ERR_INTERNET_DISCONNECTED')
        return ElMessage.error('请检查您的网络!')

      if (res.code === 'ERR_NETWORK' && (res.message.includes('timeout') || res.message === 'Network Error'))
        return ElMessage.error('无法连接至远程服务器!')

      console.error('@ERROR', res)

      return res.data
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
    })
  }

  function get(url: string, data = {}, params = {}) {
    return $http({
      method: 'GET',
      url,
      data,
      params,
    })
  }

  function put(url: string, data = {}, params = {}) {
    return $http({
      method: 'PUT',
      url,
      data,
      params,
    })
  }

  function del(url: string, data = {}, params = {}) {
    return $http({
      method: 'DELETE',
      url,
      data,
      params,
    })
  }

  function patch(url: string, data = {}, params = {}) {
    return $http({
      method: 'PATCH',
      url,
      data,
      params,
    })
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
  baseURL: `${EndNormalUrl}api`,
})
