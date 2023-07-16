
export enum GLErrorCode {
  /**
   * @describe The environment does not support the storage type.
   */
  STORAGE_NOT_AVAILABLE = 300100,

  /**
   * @describe The storage is used before initialization.
   */
  STORAGE_NOT_INITIALIZED = 300110,

  /**
   * @describe The binary data is failed to read.
   */
  DATA_ENCODING_FAILED = 310400,

  /**
   * @describe It requires the `debugMode`.
   */
  DEBUGGING_MODE_REQUIRED = 330000,
}

/**
 * @internal
 */
interface GLErrorProps {
  code: GLErrorCode
  message: string
}

export default class GLError extends Error {
  readonly code: GLErrorCode

  /**
   * @private
   */
  constructor(props: GLErrorProps) {
    super(props.message)
    this.code = props.code
  }

  /**
   * @internal
   */
  static get storageNotAvailable(): GLError {
    return new GLError({
      code: GLErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage not available.',
    })
  }

  /**
   * @internal
   */
  static get storeNotInitialized(): GLError {
    return new GLError({
      code: GLErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage is not initialized.',
    })
  }

  /**
   * @internal
   */
  static get dataEncodingFailed(): GLError {
    return new GLError({
      code: GLErrorCode.DATA_ENCODING_FAILED,
      message: 'Failed to read data from Blob.',
    })
  }

  /**
   * @internal
   */
  static get debuggingModeRequired(): GLError {
    return new GLError({
      code: GLErrorCode.DEBUGGING_MODE_REQUIRED,
      message: 'Debugging mode is required. Use GLMemoryStorage to enable the debugging mode.',
    })
  }
}
