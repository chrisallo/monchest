export declare enum BarnetErrorCode {
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
interface BarnetErrorProps {
    code: BarnetErrorCode;
    message: string;
}
export default class BarnetError extends Error {
    readonly code: BarnetErrorCode;
    /**
     * @private
     */
    constructor(props: BarnetErrorProps);
    /**
     * @internal
     */
    static get storageNotAvailable(): BarnetError;
    /**
     * @internal
     */
    static get storeNotInitialized(): BarnetError;
    /**
     * @internal
     */
    static get dataEncodingFailed(): BarnetError;
    /**
     * @internal
     */
    static get debuggingModeRequired(): BarnetError;
}
export {};
