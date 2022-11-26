import StorageObject from "./storageObjects/StorageObject";

export function hashCode(item: any): number {
    if (typeof item === 'string') {
        return item.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    } else if (typeof item === 'number') {
        return item;
    } else if (typeof item === 'object') {
        if (item instanceof StorageObject) return item.hashCode();
        return Object.values(item).map(hashCode).reduce((a, b) => {
            a = ((a << 5) - a) + b;
            return a & a;
        }, 0);
    } else {
        return 0;
    }
}