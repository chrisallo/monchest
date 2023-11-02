
import MonchestStorage, { MonchestEncryptionPolicy, MonchestStorageData } from './storage'
import MonchestMemoryStorage from './storage/memoryStorage'
import MonchestIndexedDbStorage from './storage/indexedDbStorage'
import MonchestError, { MonchestErrorCode } from './error'

enum MonchestStorageType {
  Memory = 'memory',
  IndexedDB = 'indexeddb',
}
interface MonchestProps {
  /**
   * @description
   *  A unique store name. The same key in the same store points to the same data.
   */
  name: string

  /**
   * @default false
   * @description
   *  A debug mode allows to see the raw data in memory storage.
   */
  debugMode?: boolean

  /**
   * @default MonchestStorageType.Memory
   * @description
   *  To select a storage type.
   */
  storage?: MonchestStorageType

  /**
   * @description
   *  To inject the encrypt/decrypt algorithm.
   *  If the encryption algorithm changes, Monchest would automatically detect it and clear the data before use.
   */
  encryptionPolicy?: MonchestEncryptionPolicy
}

/**
 * @description
 *  Storable types.
 */
type MonchestStorable = string | object | Blob

/**
 * @internal
 */
enum MonchestStoredDataType {
  String = 'string',
  Object = 'json',
  Blob = 'binary',
  Unknown = 'unknown',
}

/**
 * @internal
 */
interface MonchestStoredUnit {
  type: MonchestStoredDataType
  data: string | object
}

class Monchest {
  readonly name: string

  private readonly encryptionPolicy?: MonchestEncryptionPolicy
  private readonly debugMode: boolean

  private storage: MonchestStorage
  private storageInitialized: boolean

  constructor(props: MonchestProps) {
    const {
      name,
      debugMode = false,
      storage = MonchestStorageType.Memory,
      encryptionPolicy,
    } = props

    this.name = name
    this.storageInitialized = false
    this.debugMode = debugMode
    this.encryptionPolicy = encryptionPolicy

    switch (storage) {
      case MonchestStorageType.Memory:
        this.storage = new MonchestMemoryStorage({
          name,
          encryptionPolicy,
        })
        break
      case MonchestStorageType.IndexedDB:
        this.storage = new MonchestIndexedDbStorage({
          name,
          encryptionPolicy,
        })
        break
    }
  }

  private fallbackToMemoryStorage(): void {
    this.storage = new MonchestMemoryStorage({
      name: this.name,
      encryptionPolicy: this.encryptionPolicy,
    })
  }
  private async guaranteeStorageInitialized(): Promise<void> {
    if (!this.storageInitialized) {
      try {
        await this.storage.init()
        this.storageInitialized = true
      } catch (err) {
        if (err instanceof MonchestError) {
          switch (err.code) {
            case MonchestErrorCode.STORAGE_NOT_AVAILABLE: {
              this.fallbackToMemoryStorage()
              await this.guaranteeStorageInitialized()
              break
            }
          }
        }
      }
    }
  }

  /**
   * @description
   *  (Debug mode only) Returns all the data in storage as an object.
   *  It throws an error if the `debugMode` is off.
   */
  getMemoryStoreForDebugging(): object {
    if (this.debugMode) {
      if (this.storage instanceof MonchestMemoryStorage) {
        return this.storage.rawData
      }
    }
    throw MonchestError.debuggingModeRequired
  }

  /**
   * @description
   *  It saves the data with the key into the storage.
   */
  async save(key: string, data: MonchestStorable): Promise<void> {
    await this.guaranteeStorageInitialized()
    const unit: MonchestStoredUnit = {
      data,
      type: MonchestStoredDataType.Unknown
    }
    if (data instanceof Blob) {
      unit.data = {
        dataUrl: await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = () => resolve(fileReader.result as string)
          fileReader.onerror = () => reject(MonchestError.dataEncodingFailed)
          fileReader.readAsDataURL(data)
        }),
        type: data.type,
      }
      unit.type = MonchestStoredDataType.Blob
    } else if (typeof data === 'object') {
      unit.type = MonchestStoredDataType.Object
    } else if (typeof data === 'string') {
      unit.type = MonchestStoredDataType.String
    }
    await this.storage?.set(key, unit)
  }

  /**
   * @description
   *  It loads the data with the key. Returns `null` if the data is not found.
   */
  async load(key: string): Promise<MonchestStorable | null> {
    await this.guaranteeStorageInitialized()
    const unit = await this.storage?.get(key) as MonchestStoredUnit
    if (unit) {
      switch (unit.type) {
        case MonchestStoredDataType.Blob: {
          const { dataUrl, type } = unit.data as { dataUrl: string, type: string }
          if (typeof fetch !== 'undefined') {
            const res = await fetch(dataUrl)
            return await res.blob()
          } else {
            const sliceSize = 512
            const byteArrays: Uint8Array[] = []
            const bytes = atob(dataUrl.split(',')[1])
            for (let i = 0; i < bytes.length; i += sliceSize) {
              const slice = bytes.slice(i, i + sliceSize)
              const charArray = new Array(slice.length)
              for (let j = 0; j < slice.length; j++) {
                charArray[j] = slice.charCodeAt(j)
              }
              byteArrays.push(new Uint8Array(charArray))
            }
            return new Blob(byteArrays, { type })
          }
        }
        case MonchestStoredDataType.Object:
        case MonchestStoredDataType.String:
          return unit.data
      }
    }
    return null
  }

  /**
   * @description
   *  It deletes the data for the key. Returns `false` if the data is not found.
   */
  async remove(key: string): Promise<boolean> {
    await this.guaranteeStorageInitialized()
    return await this.storage?.remove(key)
  }

  /**
   * @description
   *  It clears the whole storage.
   */
  async clear(): Promise<void> {
    await this.guaranteeStorageInitialized()
    await this.storage?.clear()
  }
}

export {
  MonchestEncryptionPolicy,
  MonchestError,
  MonchestErrorCode,
  Monchest,
  MonchestProps,
  MonchestStorable,
  MonchestStorageData,
  MonchestStorageType,
}
