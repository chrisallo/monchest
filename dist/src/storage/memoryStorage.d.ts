import MonchestStorage, { type MonchestStorageData, type MonchestStorageProps } from '.';
export interface MonchestMemoryStorageProps extends MonchestStorageProps {
    readDelay?: number;
    writeDelay?: number;
}
export default class MonchestMemoryStorage extends MonchestStorage {
    private readonly delay;
    constructor(props: MonchestMemoryStorageProps);
    get rawData(): object;
    init(): Promise<void>;
    clear(): Promise<void>;
    protected getAllRawKeys(): Promise<string[]>;
    protected getRaw(key: string): Promise<object | null>;
    protected setRaw(items: MonchestStorageData[]): Promise<void>;
    protected removeRaw(keys: string[]): Promise<void>;
}
