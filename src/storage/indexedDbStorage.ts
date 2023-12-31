
import MonchestStorage, { type MonchestStorageData, type MonchestStorageProps } from '.'
import MonchestError from '../error'
import { isBrowser, isLegacyEdgeBrowser } from '../utils/compat'

interface WindowCompat extends Window {
  PointerEvent: PointerEvent
  MSPointerEvent: PointerEvent
  mozIndexedDB: IDBFactory
  webkitIndexedDB: IDBFactory
  msIndexedDB: IDBFactory
}

type IDBOpenDBRequestEvent = Event & { target: IDBOpenDBRequest }
type IDBVersionChangeEventPrivate = IDBVersionChangeEvent & IDBOpenDBRequestEvent
type IDBRequestEvent = Event & { target: IDBRequest<unknown> }
type IDBGetAllKeysRequestEvent = IDBRequestEvent & { target: IDBRequest<string[]> }
type IDBGetRequestResult = { key: string, value: object }
type IDBGetRequestEvent = IDBRequestEvent & { target: IDBRequest<IDBGetRequestResult> }

type IndexedDbOpenJob = () => void

enum IndexedDbStorageState {
  UNINITIALIZED,
  OPENING,
  OPEN,
  CLOSED,
}

const INDEXEDDB_OBJECTSTORE_NAME = 'Monchest'
const INDEXEDDB_ITEM_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB
const INDEXEDDB_REOPEN_DELAY = 10

export interface MonchestIndexedDbStorageProps extends MonchestStorageProps {}

export default class MonchestIndexedDbStorage extends MonchestStorage {
  private state: IndexedDbStorageState
  private window?: WindowCompat
  private indexedDb?: IDBFactory
  private database?: IDBDatabase
  private openJobQueue: IndexedDbOpenJob[] = []

  constructor(props: MonchestIndexedDbStorageProps) {
    super({
      ...props,
      maxRawSize: INDEXEDDB_ITEM_SIZE_LIMIT,
    })
    this.window = typeof window !== 'undefined' ? ((window as unknown) as WindowCompat) : undefined
    this.indexedDb = this.window
      ? this.window.indexedDB || this.window.mozIndexedDB || this.window.webkitIndexedDB || this.window.msIndexedDB
      : undefined
  }

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.indexedDb) {
        this.state = IndexedDbStorageState.OPENING
        const openDBRequest = this.indexedDb.open(this.name)
        openDBRequest.addEventListener('upgradeneeded', (ev: IDBVersionChangeEventPrivate) => {
          const database: IDBDatabase = ev.target.result
          database.createObjectStore(INDEXEDDB_OBJECTSTORE_NAME, { keyPath: 'key' })
        })
        openDBRequest.addEventListener('success', (ev: IDBOpenDBRequestEvent) => {
          this.state = IndexedDbStorageState.OPEN
          this.database = ev.target.result

          this.openJobQueue.forEach((job: IndexedDbOpenJob) => job())
          this.openJobQueue = []

          // RE-OPEN ON UNINTENTIONAL CLOSE EVENT
          this.database.onclose = () => {
            this.database = undefined
            this.state = IndexedDbStorageState.OPENING
            setTimeout(() => {
              this.open()
            }, INDEXEDDB_REOPEN_DELAY)
          }
          resolve(this.database)
        })
        openDBRequest.addEventListener('error', (ev: IDBOpenDBRequestEvent) => {
          this.state = IndexedDbStorageState.UNINITIALIZED
          reject(ev.target.error)
        })
      } else {
        reject(MonchestError.storageNotAvailable)
      }
    })
  }
  private async getObjectStore(access: 'readwrite' | 'readonly'): Promise<IDBObjectStore> {
    if (this.database) {
      return this.database.transaction(INDEXEDDB_OBJECTSTORE_NAME, access).objectStore(INDEXEDDB_OBJECTSTORE_NAME)
    } else {
      switch (this.state) {
        case IndexedDbStorageState.UNINITIALIZED:
        case IndexedDbStorageState.OPEN:
          throw MonchestError.storeNotInitialized

        case IndexedDbStorageState.OPENING:
        case IndexedDbStorageState.CLOSED:
          return await new Promise((resolve) => {
            this.openJobQueue.push(() => resolve(this.getObjectStore(access)))
          })
      }
    }
  }

  async init(): Promise<void> {
    if (this.window) {
      this.indexedDb = this.window.indexedDB || this.window.mozIndexedDB || this.window.webkitIndexedDB || this.window.msIndexedDB
      if (this.window && isBrowser()) {
        if (isLegacyEdgeBrowser()) {
          if (!this.window.indexedDB && (this.window.PointerEvent || this.window.MSPointerEvent)) {
            throw MonchestError.storageNotAvailable
          }
        } else {
          await new Promise<void>((resolve, reject) => {
            if (this.indexedDb) {
              try {
                const db = this.indexedDb.open('_testMozilla')
                db.onerror = () => reject(MonchestError.storageNotAvailable)
                db.onsuccess = () => resolve()
              } catch {
                reject(MonchestError.storageNotAvailable)
              }
            } else {
              reject(MonchestError.storageNotAvailable)
            }
          })
        }
      } else {
        throw MonchestError.storageNotAvailable
      }
    } else {
      throw MonchestError.storageNotAvailable
    }
    this.database = await this.open()
    await this.resetIfEncryptionChanged()
  }
  async clear(): Promise<void> {
    const objectStore = await this.getObjectStore('readwrite')
    return await new Promise((resolve, reject) => {
      const request: IDBRequest = objectStore.clear()
      request.addEventListener('success', (/* ev: IDBGetRequestEvent */) => resolve())
      request.addEventListener('error', (ev: IDBGetRequestEvent) => reject(ev.target.error))
    })
  }
  protected async getAllRawKeys(): Promise<string[]> {
    const objectStore = await this.getObjectStore('readonly')
    return await new Promise((resolve, reject) => {
      const request: IDBRequest = objectStore.getAllKeys()
      request.addEventListener('success', (ev: IDBGetAllKeysRequestEvent) => resolve(ev.target.result))
      request.addEventListener('error', (ev: IDBGetAllKeysRequestEvent) => reject(ev.target.error))
    })
  }
  protected async getRaw(key: string): Promise<object | null> {
    const objectStore = await this.getObjectStore('readonly')
    return await new Promise((resolve, reject) => {
      const request: IDBRequest = objectStore.get(key)
      request.addEventListener('success', (ev: IDBGetRequestEvent) => {
        const data = ev?.target?.result as MonchestStorageData
        resolve(data?.value)
      })
      request.addEventListener('error', (ev: IDBGetRequestEvent) => reject(ev.target.error))
    })
  }
  protected async setRaw(items: MonchestStorageData[]): Promise<void> {
    const objectStore = await this.getObjectStore('readwrite')
    await Promise.all<void>(
      items.map((item: MonchestStorageData) => {
        return new Promise((resolve, reject) => {
          const request: IDBRequest = objectStore.put(item)
          request.addEventListener('success', () => resolve())
          request.addEventListener('error', () => reject(new Error('Failed to write.')))
        })
      }),
    )
  }
  protected async removeRaw(keys: string[]): Promise<void> {
    const objectStore = await this.getObjectStore('readwrite')
    await Promise.all<string>(keys.map((key: string) => {
      return new Promise((resolve, reject) => {
        const request: IDBRequest = objectStore.delete(key)
        request.addEventListener('success', (/* ev: IDBRemoveRequestEvent */) => resolve(key))
        request.addEventListener('error', (ev: IDBGetRequestEvent) => reject(ev.target.error))
      })
    }))
  }
}
