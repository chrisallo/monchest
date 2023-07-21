export declare enum MonchestErrorCode {
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
    DEBUGGING_MODE_REQUIRED = 330000
}
/**
 * @internal
 */
interface MonchestErrorProps {
    code: MonchestErrorCode;
    message: string;
}
export default class MonchestError extends Error {
    readonly code: MonchestErrorCode;
    /**
     * @private
     */
    constructor(props: MonchestErrorProps);
    /**
     * @internal
     */
    static get storageNotAvailable(): MonchestError;
    /**
     * @internal
     */
    static get storeNotInitialized(): MonchestError;
    /**
     * @internal
     */
    static get dataEncodingFailed(): MonchestError;
    /**
     * @internal
     */
    static get debuggingModeRequired(): MonchestError;
}
export {};
