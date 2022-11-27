import {hashCode} from './Utils';
import StorageObject from './storageObjects/StorageObject';

function numToStr(num: number[]): string{
    return num.map(n => n.toString(36)).join('|');
}

function strToNum(str: string): number[]{
    return str.split('|').map(s => parseInt(s, 36));
}

export default class Storage {
    items: any = {};
    hashList : number[] = [];
    historyHashList: number[];
    trigger: StorageHistoryTrigger = () => '$';

    getStorageHistory(): string {
        return numToStr(this.hashList);
    }

    verifyHistory(hash: string): boolean {
        return this.getStorageHistory() === hash;
    }

    startTraceHistoryDiscrepancy(hash: string): void{
        this.historyHashList = strToNum(hash);
    }

    snapshotHash(path: string): void {
        let newHash = this.hashCode(path);
        if(this.historyHashList) {
            let historyHash = this.historyHashList.shift();
            if(historyHash !== newHash) {
                throw new Error(`Hash mismatch: ${historyHash} !== ${newHash}`);
            }
        }
        this.hashList.push(newHash);
    }

    set(key: string, value: any, current: any = this.items): void {
        let paths = key.split('.');
        if (paths.length === 1) {
            let hash;
            if(typeof value === 'string' && value.startsWith('[')) {
                value = StorageObject.parse(value);
                value.storage = this;
                hash = value.hashCode();
            } else {
                value = JSON.stringify(value);
                hash = hashCode(value);
            }
            current[paths[0]] = value;
            let hashFlag = this.trigger(this, hash);
            if(hashFlag && hashFlag.startsWith('$')) {
                hashFlag = hashFlag.length > 2?hashFlag.substring(2):undefined;
                this.snapshotHash(hashFlag);
            }
        } else {
            let nextPath = paths.shift();
            if(!current[0][nextPath]) {
                current[0][nextPath] = {};
            }
            this.set(paths.join('.'), value, current[nextPath]);
        }
    }

    get(key: string): any {
        let paths = key.split('.');
        let current = this.items;
        for(let i = 0; i < paths.length - 1; i++) {
            let path = paths[i];
            if(!current[path]) return undefined;
            current = current[path];
        }
        let value = current[paths[paths.length - 1]];
        if(value === undefined) return undefined;
        if(value instanceof StorageObject) {
            let result = value.get();
            let hashFlag = this.trigger(this, value.hashCode());
            if(hashFlag && hashFlag.startsWith('$')) {
                hashFlag = hashFlag.length > 2?hashFlag.substring(2):undefined;
                this.snapshotHash(hashFlag);
            }
            return result;
        }
        return JSON.parse(value);
    }

    hashCode(pathString?: string): number {
        let paths = pathString?pathString.split('.'):[];
        let current = this.items;
        for(let i = 0; i < paths.length - 1; i++) {
            let path = paths[i];
            if(!current[path]) throw new Error('Path not found');
            current = current[path];
        }
        return this._hashCode(current);
    }

    private _hashCode(current: any = this.items): number {
        let hash = '';
        for(let key in current) {
            let value = current[key];
            if(value instanceof StorageObject) {
                hash += hashCode(key + ',' + value.hashCode());
            } else {
                hash += hashCode(key + ',' + value);
            }
        }
        return hashCode(hash);
    }
}

// result denotes the path to be hashed, starting with '$'
export type StorageHistoryTrigger = (storage: Storage, setHash: number) => string
