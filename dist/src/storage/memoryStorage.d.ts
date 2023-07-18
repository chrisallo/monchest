import BarnetStorage, { type BarnetStorageData, type BarnetStorageProps } from '.';
export interface BarnetMemoryStorageProps extends BarnetStorageProps {
    readDelay?: number;
    writeDelay?: number;
}
export default class BarnetMemoryStorage extends BarnetStorage {
    private readonly delay;
    constructor(props: BarnetMemoryStorageProps);
    get rawData(): object;
    init(): Promise<void>;
    clear(): Promise<void>;
    protected getAllRawKeys(): Promise<string[]>;
    protected getRaw(key: string): Promise<object | null>;
    protected setRaw(items: BarnetStorageData[]): Promise<void>;
    protected removeRaw(keys: string[]): Promise<void>;
}
