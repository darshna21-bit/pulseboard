/**
 * ARCHITECTURAL CONTRACT:
 * MockJobSocket intentionally mirrors the browser's native WebSocket interface:
 *   - onopen: ((event: Event) => void) | null
 *   - onmessage: ((event: MessageEvent<string>) => void) | null
 *   - onclose: ((event: CloseEvent) => void) | null
 *   - onerror: ((event: Event) => void) | null
 *   - readyState: 0 (CONNECTING), 1 (OPEN), 2 (CLOSING), 3 (CLOSED)
 *   - close(code?: number, reason?: string): void
 *
 * This strict adherence to the native WebSocket API enables polymorphic substitution
 * (Liskov Substitution Principle). When swapping this mock for a real backend in production,
 * only the socket instantiation factory call needs to be updated (e.g., `new WebSocket(url)`),
 * without modifying any consuming hooks, state machines, or UI components.
 */

import { generateJob } from './jobData'

function createCloseEvent(
  type: string,
  init?: { code?: number; reason?: string; wasClean?: boolean },
): CloseEvent {
  if (typeof CloseEvent !== 'undefined') {
    return new CloseEvent(type, init)
  }
  // Fallback for Node / SSR / test environments
  const event = new Event(type) as CloseEvent
  Object.defineProperty(event, 'code', { value: init?.code ?? 1000 })
  Object.defineProperty(event, 'reason', { value: init?.reason ?? '' })
  Object.defineProperty(event, 'wasClean', { value: init?.wasClean ?? true })
  return event
}

function createMessageEvent<T>(type: string, data: T): MessageEvent<T> {
  if (typeof MessageEvent !== 'undefined') {
    return new MessageEvent(type, { data })
  }
  // Fallback for Node / SSR / test environments
  const event = new Event(type) as MessageEvent<T>
  Object.defineProperty(event, 'data', { value: data })
  return event
}

export class MockJobSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  public readyState: number = MockJobSocket.CONNECTING
  public onopen: ((event: Event) => void) | null = null
  public onmessage: ((event: MessageEvent<string>) => void) | null = null
  public onclose: ((event: CloseEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null

  private connectionTimer: ReturnType<typeof setTimeout> | null = null
  private streamTimer: ReturnType<typeof setTimeout> | null = null
  private dropTimer: ReturnType<typeof setTimeout> | null = null
  private isClosedManually = false

  constructor() {
    this.initiateConnection()
  }

  /**
   * Simulates network handshake delay between 700ms and 1300ms.
   */
  private initiateConnection(): void {
    const handshakeDelay = Math.floor(Math.random() * 600) + 700 // 700 - 1300ms

    this.connectionTimer = setTimeout(() => {
      if (this.readyState !== MockJobSocket.CONNECTING) return

      this.readyState = MockJobSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }

      this.scheduleNextJobEmission()
      this.scheduleDroppedConnection()
    }, handshakeDelay)
  }

  /**
   * Emits a new Job as a JSON string every 3.2 to 5.8 seconds.
   */
  private scheduleNextJobEmission(): void {
    if (this.readyState !== MockJobSocket.OPEN) return

    const emissionInterval = Math.floor(Math.random() * 2600) + 3200 // 3200 - 5800ms

    this.streamTimer = setTimeout(() => {
      if (this.readyState !== MockJobSocket.OPEN) return

      const newJob = generateJob()
      const jobJson = JSON.stringify(newJob)

      if (this.onmessage) {
        const messageEvent = createMessageEvent('message', jobJson)
        this.onmessage(messageEvent)
      }

      // Chain the next emission
      this.scheduleNextJobEmission()
    }, emissionInterval)
  }

  /**
   * Randomly simulates a dropped network connection 15 to 30 seconds after opening
   * to exercise client reconnection and resilient backoff handling.
   */
  private scheduleDroppedConnection(): void {
    const dropDelay = Math.floor(Math.random() * 15000) + 15000 // 15000 - 30000ms

    this.dropTimer = setTimeout(() => {
      if (this.readyState !== MockJobSocket.OPEN || this.isClosedManually) return

      // Abrupt closure (standard WebSocket 1006 code for abnormal closure)
      this.clearAllTimers()
      this.readyState = MockJobSocket.CLOSED

      if (this.onclose) {
        const closeEvent = createCloseEvent('close', {
          code: 1006,
          reason: 'Network connection dropped unexpectedly',
          wasClean: false,
        })
        this.onclose(closeEvent)
      }
    }, dropDelay)
  }

  /**
   * Clears all scheduled asynchronous timers.
   */
  private clearAllTimers(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = null
    }
    if (this.streamTimer) {
      clearTimeout(this.streamTimer)
      this.streamTimer = null
    }
    if (this.dropTimer) {
      clearTimeout(this.dropTimer)
      this.dropTimer = null
    }
  }

  /**
   * Manually closes the socket connection, clearing timers and transitioning to CLOSED state.
   */
  public close(code = 1000, reason = 'Normal Closure'): void {
    if (this.readyState === MockJobSocket.CLOSED) return

    this.isClosedManually = true
    this.clearAllTimers()
    this.readyState = MockJobSocket.CLOSED

    if (this.onclose) {
      const closeEvent = createCloseEvent('close', {
        code,
        reason,
        wasClean: code === 1000,
      })
      this.onclose(closeEvent)
    }
  }
}
