
import BNStorage, { BNEncryptionPolicy, BNStorageData } from './storage'
import BNMemoryStorage from './storage/memoryStorage'
import BNIndexedDbStorage from './storage/indexedDbStorage'
import BNError, { BNErrorCode } from './error'

enum BNStorageType {
  Memory = 'memory',
  IndexedDB = 'indexeddb',
}
interface BarnetProps {
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
   * @default BNStorageType.Memory
   * @description
   *  To select a storage type.
   */
  storage?: BNStorageType

  /**
   * @description
   *  To inject the encrypt/decrypt algorithm.
   *  If the encryption algorithm changes, Barnet would automatically detect it and clear the data before use.
   */
  encryptionPolicy?: BNEncryptionPolicy
}

/**
 * @description
 *  Storable types.
 */
type BarnetStorable = string | object | Blob

/**
 * @internal
 */
enum BNStoredDataType {
  String = 'string',
  Object = 'json',
  Blob = 'binary',
  Unknown = 'unknown',
}

/**
 * @internal
 */
interface BNStoredUnit {
  type: BNStoredDataType
  data: string | object
}

class Barnet {
  readonly name: string

  private readonly encryptionPolicy?: BNEncryptionPolicy
  private readonly debugMode: boolean

  private storage: BNStorage
  private storageInitialized: boolean

  constructor(props: BarnetProps) {
    const {
      name,
      debugMode = false,
      storage = BNStorageType.Memory,
      encryptionPolicy,
    } = props

    this.name = name
    this.storageInitialized = false
    this.debugMode = debugMode
    this.encryptionPolicy = encryptionPolicy

    switch (storage) {
      case BNStorageType.Memory:
        this.storage = new BNMemoryStorage({
          name,
          encryptionPolicy,
        })
        break
      case BNStorageType.IndexedDB:
        this.storage = new BNIndexedDbStorage({
          name,
          encryptionPolicy,
        })
        break
    }
  }

  private fallbackToMemoryStorage(): void {
    this.storage = new BNMemoryStorage({
      name: this.name,
      encryptionPolicy: this.encryptionPolicy,
    })
  }
  private async guaranteeStorageInitialized(): Promise<void> {
    if (this.storageInitialized) {
      try {
        await this.storage.init()
        this.storageInitialized = true
      } catch (err) {
        if (err instanceof BNError) {
          switch (err.code) {
            case BNErrorCode.STORAGE_NOT_AVAILABLE: {
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
      if (this.storage instanceof BNMemoryStorage) {
        return this.storage.rawData
      }
    }
    throw BNError.debuggingModeRequired
  }

  /**
   * @description
   *  It saves the data with the key into the storage.
   */
  async save(key: string, data: BarnetStorable): Promise<void> {
    await this.guaranteeStorageInitialized()
    const unit: BNStoredUnit = {
      data,
      type: BNStoredDataType.Unknown
    }
    if (data instanceof Blob) {
      unit.data = {
        dataUrl: await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = () => resolve(fileReader.result as string)
          fileReader.onerror = () => reject(BNError.dataEncodingFailed)
          fileReader.readAsDataURL(data)
        }),
        type: data.type,
      }
      unit.type = BNStoredDataType.Blob
    } else if (typeof data === 'object') {
      unit.type = BNStoredDataType.Object
    } else if (typeof data === 'string') {
      unit.type = BNStoredDataType.String
    }
    await this.storage?.set(key, unit)
  }

  /**
   * @description
   *  It loads the data with the key. Returns `null` if the data is not found.
   */
  async load(key: string): Promise<BarnetStorable | null> {
    await this.guaranteeStorageInitialized()
    const unit = await this.storage?.get(key) as BNStoredUnit
    if (unit) {
      switch (unit.type) {
        case BNStoredDataType.Blob: {
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
        case BNStoredDataType.Object:
        case BNStoredDataType.String:
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
  BNEncryptionPolicy,
  BNError,
  BNErrorCode,
  Barnet,
  BarnetProps,
  BarnetStorable,
  BNStorageData,
  BNStorageType,
}
