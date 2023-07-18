
export enum BarnetErrorCode {
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
interface BarnetErrorProps {
  code: BarnetErrorCode
  message: string
}

export default class BarnetError extends Error {
  readonly code: BarnetErrorCode

  /**
   * @private
   */
  constructor(props: BarnetErrorProps) {
    super(props.message)
    this.code = props.code
  }

  /**
   * @internal
   */
  static get storageNotAvailable(): BarnetError {
    return new BarnetError({
      code: BarnetErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage not available.',
    })
  }

  /**
   * @internal
   */
  static get storeNotInitialized(): BarnetError {
    return new BarnetError({
      code: BarnetErrorCode.STORAGE_NOT_AVAILABLE,
      message: 'Storage is not initialized.',
    })
  }

  /**
   * @internal
   */
  static get dataEncodingFailed(): BarnetError {
    return new BarnetError({
      code: BarnetErrorCode.DATA_ENCODING_FAILED,
      message: 'Failed to read data from Blob.',
    })
  }

  /**
   * @internal
   */
  static get debuggingModeRequired(): BarnetError {
    return new BarnetError({
      code: BarnetErrorCode.DEBUGGING_MODE_REQUIRED,
      message: 'Debugging mode is required. Use BarnetMemoryStorage to enable the debugging mode.',
    })
  }
}
