
import GLStorageDriver, { GLEncryptionPolicy, GLStorageData } from './driver/storageDriver'
import GLMemoryStorageDriver from './driver/memoryStorageDriver'
import GLIndexedDbStorageDriver from './driver/indexedDbStorageDriver'
import GLError, { GLErrorCode } from './error'

enum GLStorageDriverType {
  Memory,
  IndexedDB,
}

interface GlacierProps {
  name: string
  driver?: GLStorageDriverType
  encryptionPolicy?: GLEncryptionPolicy
}

export default class Glacier {
  private driver: GLStorageDriver

  constructor(props: GlacierProps) {
    const {
      name,
      driver = GLStorageDriverType.Memory,
      encryptionPolicy,
    } = props

    switch (driver) {
      case GLStorageDriverType.Memory:
        this.driver = new GLMemoryStorageDriver({
          name,
          encryptionPolicy,
        })
        break
      case GLStorageDriverType.IndexedDB:
        this.driver = new GLIndexedDbStorageDriver({
          name,
          encryptionPolicy,
        })
        break
    }
  }
  get isDebuggingMode(): boolean {
    return this.driver instanceof GLMemoryStorageDriver
  }
  getMemoryStoreForDebugging(): Record<string, object> {
    if (this.isDebuggingMode) {
      return (this.driver as GLMemoryStorageDriver).rawData
    }
    throw GLError.debuggingModeRequired
  }
}

export {
  GLEncryptionPolicy,
  GLError,
  GLErrorCode,
  GlacierProps,
  GLStorageData,
  GLStorageDriverType,
}