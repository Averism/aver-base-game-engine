import Storage from "../Storage";

export default abstract class StorageObject {
    public storage: Storage;
    public abstract toString(): string;
    public abstract hashCode(): number;
    public abstract get(): any;
    public abstract set(value: any): void;
    static library: {[key: string]: StorageObject} = {};
    static parse(value: string): StorageObject | string {
        if(value.startsWith('[') && !value.startsWith('[[')) {
            let name = value.substring(1).split(']')[0];
            let args = value.substring(name.length + 2).split(',');
            if(!this.library[name]) throw new Error(`Unknown StorageObject: ${name}`);
            let proto = Object.getPrototypeOf(this.library[name]);
            if(!proto) throw new Error(`Cannot get prototype of ${name}`);
            let constructor = proto.constructor;
            if(!constructor) throw new Error(`Constructor ${name} not found`);
            return new constructor(...args);
        }
        return value.substring(1);
    }
}