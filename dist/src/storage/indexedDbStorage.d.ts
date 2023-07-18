import BarnetStorage, { type BarnetStorageData, type BarnetStorageProps } from '.';
export interface BarnetIndexedDbStorageProps extends BarnetStorageProps {
}
export default class BarnetIndexedDbStorage extends BarnetStorage {
    private state;
    private window?;
    private indexedDb?;
    private database?;
    private openJobQueue;
    constructor(props: BarnetIndexedDbStorageProps);
    private open;
    private getObjectStore;
    init(): Promise<void>;
    clear(): Promise<void>;
    protected getAllRawKeys(): Promise<string[]>;
    protected getRaw(key: string): Promise<object | null>;
    protected setRaw(items: BarnetStorageData[]): Promise<void>;
    protected removeRaw(keys: string[]): Promise<void>;
}
