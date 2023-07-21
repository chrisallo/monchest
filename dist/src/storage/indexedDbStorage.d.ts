import MonchestStorage, { type MonchestStorageData, type MonchestStorageProps } from '.';
export interface MonchestIndexedDbStorageProps extends MonchestStorageProps {
}
export default class MonchestIndexedDbStorage extends MonchestStorage {
    private state;
    private window?;
    private indexedDb?;
    private database?;
    private openJobQueue;
    constructor(props: MonchestIndexedDbStorageProps);
    private open;
    private getObjectStore;
    init(): Promise<void>;
    clear(): Promise<void>;
    protected getAllRawKeys(): Promise<string[]>;
    protected getRaw(key: string): Promise<object | null>;
    protected setRaw(items: MonchestStorageData[]): Promise<void>;
    protected removeRaw(keys: string[]): Promise<void>;
}
