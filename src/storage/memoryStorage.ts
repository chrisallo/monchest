
import GLStorage, { type GLStorageData, type GLStorageProps } from '.'
import { sleep } from '../utils/sleep'

export interface GLMemoryStorageProps extends GLStorageProps {
  readDelay?: number
  writeDelay?: number
}

const MEMORY_ITEM_SIZE_LIMIT = 10 * 1024 * 1024 // 10MB
const DEFAULT_MEMORY_STORAGE_READ_DELAY = 0
const DEFAULT_MEMORY_STORAGE_WRITE_DELAY = 1

export default class GLMemoryStorage extends GLStorage {
  private store: object
  private readonly delay: {
    read: number
    write: number
  }

  constructor(props: GLMemoryStorageProps) {
    super({
      ...props,
      maxRawSize: MEMORY_ITEM_SIZE_LIMIT,
    })
    this.store = {}
    this.delay = {
      read: props.readDelay ?? DEFAULT_MEMORY_STORAGE_READ_DELAY,
      write: props.writeDelay ?? DEFAULT_MEMORY_STORAGE_WRITE_DELAY,
    }
  }
  get rawData(): object {
    return this.store
  }
  async init(): Promise<void> {
    this.store = {}
  }
  async clear(): Promise<void> {
    await sleep(this.delay.write)
    this.store = {}
  }
  protected async getAllRawKeys(): Promise<string[]> {
    await sleep(this.delay.read)
    return Object.keys(this.store)
  }
  protected async getRaw(key: string): Promise<object | null> {
    await sleep(this.delay.read)
    return this.store[key] ?? null
  }
  protected async setRaw(items: GLStorageData[]): Promise<void> {
    await sleep(this.delay.write)
    items.forEach((item: GLStorageData): void => {
      this.store[item.key] = item.value
    })
  }
  protected async removeRaw(keys: string[]): Promise<void> {
    await sleep(this.delay.write)
    keys.forEach((key: string) => {
      if (this.store[key]) {
        delete this.store[key]
      }
    })
  }
}
