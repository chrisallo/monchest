export interface MonchestEncryptionPolicy {
    /**
     * @describe
     *  The function to encrypt an object to an encrypted string.
     */
    encrypt: (data: object) => string;
    /**
     * @describe
     *  The function to decrypt an encrypted string to the original data.
     */
    decrypt: (encrypted: string) => object;
}
/**
 * @internal
 */
export interface MonchestStorageProps {
    name: string;
    maxRawSize?: number;
    encryptionPolicy?: MonchestEncryptionPolicy;
}
/**
 * @internal
 */
export interface MonchestStorageData {
    key: string;
    value: object;
}
export default abstract class MonchestStorage {
    readonly name: string;
    readonly encryptionPolicy: MonchestEncryptionPolicy;
    protected readonly maxRawSize: number;
    private get reservedKeys();
    abstract init(): Promise<void>;
    abstract clear(): Promise<void>;
    protected abstract getAllRawKeys(): Promise<string[]>;
    protected abstract getRaw(key: string): Promise<object | null>;
    protected abstract setRaw(data: MonchestStorageData[]): Promise<void>;
    protected abstract removeRaw(keys: string[]): Promise<void>;
    protected resetIfEncryptionChanged(): Promise<void>;
    private createRawKey;
    private generateShardPostfixArray;
    private shardify;
    constructor(props: MonchestStorageProps);
    getAllKeys(): Promise<string[]>;
    get(key: string): Promise<object | null>;
    set(key: string, value: object): Promise<void>;
    setMany(items: MonchestStorageData[]): Promise<void>;
    remove(key: string): Promise<boolean>;
    removeMany(keys: string[]): Promise<void>;
}
