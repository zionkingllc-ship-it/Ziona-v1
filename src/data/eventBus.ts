type AppEvent = {
  type: string
  timestamp: number
  data?: Record<string, unknown>
}

type EventHandler = (event: AppEvent) => void

const listeners = new Map<string, Set<EventHandler>>()

export function emitAppEvent(event: AppEvent): void {
  const handlers = listeners.get(event.type)
  if (handlers) {
    handlers.forEach((handler) => handler(event))
  }
}

export function onAppEvent(type: string, handler: EventHandler): () => void {
  if (!listeners.has(type)) {
    listeners.set(type, new Set())
  }
  listeners.get(type)!.add(handler)
  return () => {
    listeners.get(type)?.delete(handler)
  }
}

export function offAppEvent(type: string, handler: EventHandler): void {
  listeners.get(type)?.delete(handler)
}
