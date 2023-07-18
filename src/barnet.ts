
import BarnetStorage, { BarnetEncryptionPolicy, BarnetStorageData } from './storage'
import BarnetMemoryStorage from './storage/memoryStorage'
import BarnetIndexedDbStorage from './storage/indexedDbStorage'
import BarnetError, { BarnetErrorCode } from './error'

enum BarnetStorageType {
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
   * @default BarnetStorageType.Memory
   * @description
   *  To select a storage type.
   */
  storage?: BarnetStorageType

  /**
   * @description
   *  To inject the encrypt/decrypt algorithm.
   *  If the encryption algorithm changes, Barnet would automatically detect it and clear the data before use.
   */
  encryptionPolicy?: BarnetEncryptionPolicy
}

/**
 * @description
 *  Storable types.
 */
type BarnetStorable = string | object | Blob

/**
 * @internal
 */
enum BarnetStoredDataType {
  String = 'string',
  Object = 'json',
  Blob = 'binary',
  Unknown = 'unknown',
}

/**
 * @internal
 */
interface BarnetStoredUnit {
  type: BarnetStoredDataType
  data: string | object
}

class Barnet {
  readonly name: string

  private readonly encryptionPolicy?: BarnetEncryptionPolicy
  private readonly debugMode: boolean

  private storage: BarnetStorage
  private storageInitialized: boolean

  constructor(props: BarnetProps) {
    const {
      name,
      debugMode = false,
      storage = BarnetStorageType.Memory,
      encryptionPolicy,
    } = props

    this.name = name
    this.storageInitialized = false
    this.debugMode = debugMode
    this.encryptionPolicy = encryptionPolicy

    switch (storage) {
      case BarnetStorageType.Memory:
        this.storage = new BarnetMemoryStorage({
          name,
          encryptionPolicy,
        })
        break
      case BarnetStorageType.IndexedDB:
        this.storage = new BarnetIndexedDbStorage({
          name,
          encryptionPolicy,
        })
        break
    }
  }

  private fallbackToMemoryStorage(): void {
    this.storage = new BarnetMemoryStorage({
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
        if (err instanceof BarnetError) {
          switch (err.code) {
            case BarnetErrorCode.STORAGE_NOT_AVAILABLE: {
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
      if (this.storage instanceof BarnetMemoryStorage) {
        return this.storage.rawData
      }
    }
    throw BarnetError.debuggingModeRequired
  }

  /**
   * @description
   *  It saves the data with the key into the storage.
   */
  async save(key: string, data: BarnetStorable): Promise<void> {
    await this.guaranteeStorageInitialized()
    const unit: BarnetStoredUnit = {
      data,
      type: BarnetStoredDataType.Unknown
    }
    if (data instanceof Blob) {
      unit.data = {
        dataUrl: await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = () => resolve(fileReader.result as string)
          fileReader.onerror = () => reject(BarnetError.dataEncodingFailed)
          fileReader.readAsDataURL(data)
        }),
        type: data.type,
      }
      unit.type = BarnetStoredDataType.Blob
    } else if (typeof data === 'object') {
      unit.type = BarnetStoredDataType.Object
    } else if (typeof data === 'string') {
      unit.type = BarnetStoredDataType.String
    }
    await this.storage?.set(key, unit)
  }

  /**
   * @description
   *  It loads the data with the key. Returns `null` if the data is not found.
   */
  async load(key: string): Promise<BarnetStorable | null> {
    await this.guaranteeStorageInitialized()
    const unit = await this.storage?.get(key) as BarnetStoredUnit
    if (unit) {
      switch (unit.type) {
        case BarnetStoredDataType.Blob: {
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
        case BarnetStoredDataType.Object:
        case BarnetStoredDataType.String:
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
  BarnetEncryptionPolicy,
  BarnetError,
  BarnetErrorCode,
  Barnet,
  BarnetProps,
  BarnetStorable,
  BarnetStorageData,
  BarnetStorageType,
}
