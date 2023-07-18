export interface BarnetEncryptionPolicy {
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
export interface BarnetStorageProps {
    name: string;
    maxRawSize?: number;
    encryptionPolicy?: BarnetEncryptionPolicy;
}
/**
 * @internal
 */
export interface BarnetStorageData {
    key: string;
    value: object;
}
export default abstract class BarnetStorage {
    readonly name: string;
    readonly encryptionPolicy: BarnetEncryptionPolicy;
    protected readonly maxRawSize: number;
    private get reservedKeys();
    abstract init(): Promise<void>;
    abstract clear(): Promise<void>;
    protected abstract getAllRawKeys(): Promise<string[]>;
    protected abstract getRaw(key: string): Promise<object | null>;
    protected abstract setRaw(data: BarnetStorageData[]): Promise<void>;
    protected abstract removeRaw(keys: string[]): Promise<void>;
    protected resetIfEncryptionChanged(): Promise<void>;
    private createRawKey;
    private generateShardPostfixArray;
    private shardify;
    constructor(props: BarnetStorageProps);
    getAllKeys(): Promise<string[]>;
    get(key: string): Promise<object | null>;
    set(key: string, value: object): Promise<void>;
    setMany(items: BarnetStorageData[]): Promise<void>;
    remove(key: string): Promise<boolean>;
    removeMany(keys: string[]): Promise<void>;
}
