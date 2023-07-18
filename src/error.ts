
export enum BNErrorCode {
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
interface BNErrorProps {
  code: BNErrorCode
  message: string
}

export default class BNError extends Error {
  readonly code: BNErrorCode

  /**
   * @private
   */
  constructor(props: BNErrorProps) {
    super(props.message)
    this.code = props.code
  }

  /**
   * @internal
   */
  static get storageNotAvailable(): BNError {
    return new BNError({
      code: BNErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage not available.',
    })
  }

  /**
   * @internal
   */
  static get storeNotInitialized(): BNError {
    return new BNError({
      code: BNErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage is not initialized.',
    })
  }

  /**
   * @internal
   */
  static get dataEncodingFailed(): BNError {
    return new BNError({
      code: BNErrorCode.DATA_ENCODING_FAILED,
      message: 'Failed to read data from Blob.',
    })
  }

  /**
   * @internal
   */
  static get debuggingModeRequired(): BNError {
    return new BNError({
      code: BNErrorCode.DEBUGGING_MODE_REQUIRED,
      message: 'Debugging mode is required. Use BNMemoryStorage to enable the debugging mode.',
    })
  }
}
