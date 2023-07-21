
export enum MonchestErrorCode {
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
interface MonchestErrorProps {
  code: MonchestErrorCode
  message: string
}

export default class MonchestError extends Error {
  readonly code: MonchestErrorCode

  /**
   * @private
   */
  constructor(props: MonchestErrorProps) {
    super(props.message)
    this.code = props.code
  }

  /**
   * @internal
   */
  static get storageNotAvailable(): MonchestError {
    return new MonchestError({
      code: MonchestErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage not available.',
    })
  }

  /**
   * @internal
   */
  static get storeNotInitialized(): MonchestError {
    return new MonchestError({
      code: MonchestErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage is not initialized.',
    })
  }

  /**
   * @internal
   */
  static get dataEncodingFailed(): MonchestError {
    return new MonchestError({
      code: MonchestErrorCode.DATA_ENCODING_FAILED,
      message: 'Failed to read data from Blob.',
    })
  }

  /**
   * @internal
   */
  static get debuggingModeRequired(): MonchestError {
    return new MonchestError({
      code: MonchestErrorCode.DEBUGGING_MODE_REQUIRED,
      message: 'Debugging mode is required. Use MonchestMemoryStorage to enable the debugging mode.',
    })
  }
}
