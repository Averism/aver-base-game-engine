import {hashCode} from './Utils';
import StorageObject from './storageObjects/StorageObject';

type HashNode = {
    value: number;
    children: {[key: string]: HashNode};
}

export default class Storage {
    items: any = {};
    hashes: HashNode = {value: 0, children: {}};

    set(key: string, value: any, current: [any, HashNode] = [this.items, this.hashes]): void {
        let paths = key.split('.');
        if (paths.length === 1) {
            if(typeof value === 'string' && value.startsWith('[')) {
                value = StorageObject.parse(value);
                value.storage = this;
            } else {
                value = JSON.stringify(value);
            }
            current[0][paths[0]] = value;
            current[1].children[paths[0]] = {value: hashCode(value), children: {}};
        } else {
            let nextPath = paths.shift();
            if(!current[0][nextPath]) {
                current[0][nextPath] = {};
                current[1].children[nextPath] = {value: 0, children: {}};
            }
            this.set(paths.join('.'), value, [current[0][nextPath], current[1].children[nextPath]]);
        }
        current[1].value = hashCode(Object.values(current[1].children).map(child => child.value).sort().join(','));
        console.log(this.hashes);
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
        if(value instanceof StorageObject) return value.get();
        return JSON.parse(value);
    }
}