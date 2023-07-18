import { BarnetEncryptionPolicy, BarnetStorageData } from './storage';
import BarnetError, { BarnetErrorCode } from './error';
declare enum BarnetStorageType {
    Memory = "memory",
    IndexedDB = "indexeddb"
}
interface BarnetProps {
    /**
     * @description
     *  A unique store name. The same key in the same store points to the same data.
     */
    name: string;
    /**
     * @default false
     * @description
     *  A debug mode allows to see the raw data in memory storage.
     */
    debugMode?: boolean;
    /**
     * @default BarnetStorageType.Memory
     * @description
     *  To select a storage type.
     */
    storage?: BarnetStorageType;
    /**
     * @description
     *  To inject the encrypt/decrypt algorithm.
     *  If the encryption algorithm changes, Barnet would automatically detect it and clear the data before use.
     */
    encryptionPolicy?: BarnetEncryptionPolicy;
}
/**
 * @description
 *  Storable types.
 */
type BarnetStorable = string | object | Blob;
declare class Barnet {
    readonly name: string;
    private readonly encryptionPolicy?;
    private readonly debugMode;
    private storage;
    private storageInitialized;
    constructor(props: BarnetProps);
    private fallbackToMemoryStorage;
    private guaranteeStorageInitialized;
    /**
     * @description
     *  (Debug mode only) Returns all the data in storage as an object.
     *  It throws an error if the `debugMode` is off.
     */
    getMemoryStoreForDebugging(): object;
    /**
     * @description
     *  It saves the data with the key into the storage.
     */
    save(key: string, data: BarnetStorable): Promise<void>;
    /**
     * @description
     *  It loads the data with the key. Returns `null` if the data is not found.
     */
    load(key: string): Promise<BarnetStorable | null>;
    /**
     * @description
     *  It deletes the data for the key. Returns `false` if the data is not found.
     */
    remove(key: string): Promise<boolean>;
    /**
     * @description
     *  It clears the whole storage.
     */
    clear(): Promise<void>;
}
export { BarnetEncryptionPolicy, BarnetError, BarnetErrorCode, Barnet, BarnetProps, BarnetStorable, BarnetStorageData, BarnetStorageType, };
