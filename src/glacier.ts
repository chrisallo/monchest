
import GLStorage, { GLEncryptionPolicy, GLStorageData } from './storage'
import GLMemoryStorage from './storage/memoryStorage'
import GLIndexedDbStorage from './storage/indexedDbStorage'
import GLError, { GLErrorCode } from './error'

enum GLStorageType {
  Memory = 'memory',
  IndexedDB = 'indexeddb',
}
interface GlacierProps {
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
   * @default GLStorageType.Memory
   * @description
   *  To select a storage type.
   */
  storage?: GLStorageType

  /**
   * @description
   *  To inject the encrypt/decrypt algorithm.
   *  If the encryption algorithm changes, Glacier would automatically detect it and clear the data before use.
   */
  encryptionPolicy?: GLEncryptionPolicy
}

/**
 * @description
 *  Storable types.
 */
type GlacierStorable = string | object | Blob

/**
 * @internal
 */
enum GLStoredDataType {
  String = 'string',
  Object = 'json',
  Blob = 'binary',
  Unknown = 'unknown',
}

/**
 * @internal
 */
interface GLStoredUnit {
  type: GLStoredDataType
  data: string | object
}

class Glacier {
  readonly name: string

  private readonly encryptionPolicy?: GLEncryptionPolicy
  private readonly debugMode: boolean

  private storage: GLStorage
  private storageInitialized: boolean

  constructor(props: GlacierProps) {
    const {
      name,
      debugMode = false,
      storage = GLStorageType.Memory,
      encryptionPolicy,
    } = props

    this.name = name
    this.storageInitialized = false
    this.debugMode = debugMode
    this.encryptionPolicy = encryptionPolicy

    switch (storage) {
      case GLStorageType.Memory:
        this.storage = new GLMemoryStorage({
          name,
          encryptionPolicy,
        })
        break
      case GLStorageType.IndexedDB:
        this.storage = new GLIndexedDbStorage({
          name,
          encryptionPolicy,
        })
        break
    }
  }

  private fallbackToMemoryStorage(): void {
    this.storage = new GLMemoryStorage({
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
        if (err instanceof GLError) {
          switch (err.code) {
            case GLErrorCode.STORAGE_NOT_AVAILABLE: {
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
      if (this.storage instanceof GLMemoryStorage) {
        return this.storage.rawData
      }
    }
    throw GLError.debuggingModeRequired
  }

  /**
   * @description
   *  It saves the data with the key into the storage.
   */
  async save(key: string, data: GlacierStorable): Promise<void> {
    await this.guaranteeStorageInitialized()
    const unit: GLStoredUnit = {
      data,
      type: GLStoredDataType.Unknown
    }
    if (data instanceof Blob) {
      unit.data = {
        dataUrl: await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = () => resolve(fileReader.result as string)
          fileReader.onerror = () => reject(GLError.dataEncodingFailed)
          fileReader.readAsDataURL(data)
        }),
        type: data.type,
      }
      unit.type = GLStoredDataType.Blob
    } else if (typeof data === 'object') {
      unit.type = GLStoredDataType.Object
    } else if (typeof data === 'string') {
      unit.type = GLStoredDataType.String
    }
    await this.storage?.set(key, unit)
  }

  /**
   * @description
   *  It loads the data with the key. Returns `null` if the data is not found.
   */
  async load(key: string): Promise<GlacierStorable | null> {
    await this.guaranteeStorageInitialized()
    const unit = await this.storage?.get(key) as GLStoredUnit
    if (unit) {
      switch (unit.type) {
        case GLStoredDataType.Blob: {
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
        case GLStoredDataType.Object:
        case GLStoredDataType.String:
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
  GLEncryptionPolicy,
  GLError,
  GLErrorCode,
  Glacier,
  GlacierProps,
  GlacierStorable,
  GLStorageData,
  GLStorageType,
}
