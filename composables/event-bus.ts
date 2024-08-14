export type IEventHandler = (...args: any[]) => void

export type EventName = 'USER_LOGIN_SUCCESS' | 'USER_LOGOUT_SUCCESS'

// 声明EventBus type
export interface IEventBus {
  on: {
    (eventName: 'USER_LOGIN_SUCCESS', callback: () => void): void
    (eventName: 'USER_LOGOUT_SUCCESS', callback: () => void): void
  }

  emit: {
    (eventName: 'USER_LOGIN_SUCCESS'): void
    (eventName: 'USER_LOGOUT_SUCCESS'): void
  }
}

export class EventBus implements IEventBus {
  private eventMap: Map<EventName, IEventHandler[]> = new Map()

  injectBase() {
  }

  on: IEventBus['on'] = (eventName: EventName, callback: (...args: any[]) => void) => {
    const handlers = this.eventMap.get(eventName) || []

    if (!handlers.includes(callback)) {
      handlers.push(callback)
      this.eventMap.set(eventName, handlers)
    }
  }

  emit: IEventBus['emit'] = (eventName: EventName, ...args: any[]) => {
    const handlers = this.eventMap.get(eventName)

    if (handlers)
      handlers.forEach(handler => handler(...args))
  }
}

export const $event = new EventBus()
