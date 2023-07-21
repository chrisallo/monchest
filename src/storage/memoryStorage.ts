
import MonchestStorage, { type MonchestStorageData, type MonchestStorageProps } from '.'
import { sleep } from '../utils/sleep'

export interface MonchestMemoryStorageProps extends MonchestStorageProps {
  readDelay?: number
  writeDelay?: number
}

const MEMORY_ITEM_SIZE_LIMIT = 10 * 1024 * 1024 // 10MB
const DEFAULT_MEMORY_STORAGE_READ_DELAY = 0
const DEFAULT_MEMORY_STORAGE_WRITE_DELAY = 1

const store: Record<string, object> = {}

export default class MonchestMemoryStorage extends MonchestStorage {
  private readonly delay: {
    read: number
    write: number
  }

  constructor(props: MonchestMemoryStorageProps) {
    super({
      ...props,
      maxRawSize: props.maxRawSize ?? MEMORY_ITEM_SIZE_LIMIT,
    })
    store[this.name] = {}
    this.delay = {
      read: props.readDelay ?? DEFAULT_MEMORY_STORAGE_READ_DELAY,
      write: props.writeDelay ?? DEFAULT_MEMORY_STORAGE_WRITE_DELAY,
    }
  }
  get rawData(): object {
    return store[this.name]
  }
  async init(): Promise<void> {
    store[this.name] = {}
  }
  async clear(): Promise<void> {
    await sleep(this.delay.write)
    store[this.name] = {}
  }
  protected async getAllRawKeys(): Promise<string[]> {
    await sleep(this.delay.read)
    return Object.keys(store[this.name])
  }
  protected async getRaw(key: string): Promise<object | null> {
    await sleep(this.delay.read)
    return store[this.name][key] ?? null
  }
  protected async setRaw(items: MonchestStorageData[]): Promise<void> {
    await sleep(this.delay.write)
    items.forEach((item: MonchestStorageData): void => {
      store[this.name][item.key] = { ...item.value }
    })
  }
  protected async removeRaw(keys: string[]): Promise<void> {
    await sleep(this.delay.write)
    keys.forEach((key: string) => {
      if (store[this.name][key]) {
        delete store[this.name][key]
      }
    })
  }
}
