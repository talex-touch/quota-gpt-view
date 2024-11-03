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
import { createApp, h, ref, render } from 'vue'
import type { TipType } from '../enum'
import type { MentionTip } from '.'
import { mentionManager } from '.'
import WikiTip from '~/components/message/WikiTip.vue'
import TalexTip from '~/components/message/TalexTip.vue'

import WikiDialogTip from '~/components/message/WikiDialogTip.vue'

export async function forWikiTip(message: string, stay: number = 2200, type: TipType = TipType.DEFAULT, loading: boolean = false, left: boolean = false) {
  const root: HTMLDivElement = document.createElement('div')

  let index: number = 0

  while (document.getElementById(`wiki-tip-${index}`))

    index++

  root.id = `wiki-tip-${index}`

  root.style.zIndex = '1000'
  root.style.position = 'absolute'
  root.style[left ? 'left' : 'right'] = '-100%'
  root.style.bottom = `calc(5% + ${index * 45}px)`
  root.style.transition = 'all .25s'

  const app = createApp(WikiTip, {
    message,
    stay,
    index,
    type,
    loading,
    close: async () => {
      root.style.opacity = '0'
      root.style[left ? 'left' : 'right'] = '-100%'

      await sleep(300)

      app.unmount()

      document.body.removeChild(root)
    },
  })

  document.body.appendChild(root)
  app.mount(root)

  await sleep(200)

  root.style[left ? 'left' : 'right'] = '0'
}
export function sendTip(message: string, options = {
  stay: 2200,
  type: TipType.DEFAULT,
  loading: null,
  left: false,
} as {
  stay: number
  type: TipType | 'loading' | null | Object
  loading?: Function | null
  left?: boolean
}) {
  options.stay = options.stay || 2200
  options.type = options.type || TipType.DEFAULT

  const root: HTMLDivElement = document.createElement('div')

  let index: number = 0

  while (document.getElementById(`talex-tip-${index}`))

    index++

  root.id = `talex-tip-${index}`

  root.style.zIndex = '1000'
  root.style.position = 'absolute'
  root.style[options.left ? 'left' : 'right'] = '-100%'
  root.style.bottom = `calc(5% + ${index * 65}px)`
  root.style.transition = 'all .25s'

  const oType = options.type
  const _type = ref('loading' as any)
  const _content = ref(message)

  if (options.loading) {
    options.stay = -1
    options.type = _type
  }

  const close = async () => {
    root.style.opacity = '0'
    root.style[options.left ? 'left' : 'right'] = '-100%'

    await sleep(500)

    render(null, root)

    document.body.removeChild(root)
  }

  const vNode = h(TalexTip, {
    message: _content,
    ...options,
    close,
  })

  document.body.appendChild(root)
  render(vNode, root)
  // app.(root);

  options.loading?.((message: string | null, tType: TipType | 'loading' | null) => {
    sleep(200).then(() => {
      _type.value = tType || oType

      if (message)
        _content.value = message
    })

    return close
  })

  sleep(200).then(() => root.style[options.left ? 'left' : 'right'] = '1.5%')
}

export interface DialogBtn {

  content: string
  type?: TipType
  onClick: () => Promise<boolean> // return true for close, false for deny
  loading?: (func: Function) => Promise<void> // 1 param argument for loading function, call for stop loading

}

export async function sendMentionTip(tip: MentionTip) {
  await mentionManager.applyFor(tip)
}

export async function forWikiDialogTip(title: string, message: string, btns: DialogBtn[] = [{ content: '确定', type: TipType.INFO, onClick: async () => true }]) {
  const root: HTMLDivElement = document.createElement('div')

  let index: number = 0

  while (document.getElementById(`wiki-dialog-tip-${index}`))

    index++

  root.id = `wiki-dialog-tip-${index}`

  root.style.zIndex = `${10000 + index}`

  const app = createApp(WikiDialogTip, {
    message,
    index,
    title,
    btns,
    close: async () => {
      app.unmount()

      document.body.removeChild(root)
    },
  })

  document.body.appendChild(root)

  app.mount(root)
}
