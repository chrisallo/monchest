
export enum GLErrorCode {
  STORAGE_NOT_AVAILABLE = 300100,
  STORAGE_NOT_INITIALIZED = 300110,
  DEBUGGING_MODE_REQUIRED = 330000,
}

interface GLErrorProps {
  code: GLErrorCode
  message: string
}

export default class GLError extends Error {
  readonly code: GLErrorCode

  constructor(props: GLErrorProps) {
    super(props.message)
    this.code = props.code
  }
  static get storageNotAvailable(): GLError {
    return new GLError({
      code: GLErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage not available.',
    })
  }
  static get storeNotInitialized(): GLError {
    return new GLError({
      code: GLErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage is not initialized.',
    })
  }
  static get debuggingModeRequired(): GLError {
    return new GLError({
      code: GLErrorCode.DEBUGGING_MODE_REQUIRED,
      message: 'Debugging mode is required. Use GLMemoryStorageDriver to enable the debugging mode.',
    })
  }
}