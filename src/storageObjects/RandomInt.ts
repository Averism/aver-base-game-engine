import StorageObject from './StorageObject';
import {hashCode} from '../Utils';

export default class RandomInt extends StorageObject {
    public min: number;
    public max: number;
    public counter: number = 0;
    public lastValue: number = 0;
    public seeds: string[] = [];
    constructor(min: string, max: string, ...seeds: string[]) {
        super();
        this.min = parseInt(min);
        this.max = parseInt(max);
        this.seeds = seeds;
    }
    toString(): string {
        return `[RandomInt]${this.min},${this.max}`;
    }
    hashCode(): number {
        return hashCode(this.toString());
    }
    getSeeds(): string[] {
        return this.seeds.map(seed => seed.startsWith('@')&&!seed.startsWith('@@')?this.storage.get(seed):seed);
    }
    get(): number {
        let seeds = this.getSeeds().concat([(this.counter++).toString()]);
        let delta = this.max - this.min;
        this.lastValue = hashCode(seeds.join(',')) % delta;
        if (this.lastValue < this.min) this.lastValue += delta;
        if (this.lastValue > this.max) this.lastValue -= delta;
        return this.lastValue;
    }
    set(value: any): void {
        throw new Error('RandomInt is read-only');
    }
}