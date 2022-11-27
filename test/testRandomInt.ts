import * as Assert from 'assert';
import main from '../src/index';
import Engine from '../src/engine';
import { ActionInterface } from '../src/Actions';
import Storage from '../src/Storage';
import StorageObject from '../src/storageObjects/StorageObject';
import RandomInt from '../src/storageObjects/RandomInt';
import { randomInt } from './commons';

const actionInterfaces: ActionInterface[] = [
    randomInt.actionInterface,
]

describe("RandomInt",()=>{
    it("should be consistent",()=>{
        StorageObject.library['randomInt'] = new RandomInt('0','1');
        let engine = new Engine(actionInterfaces);
        engine.storage.set('randomInt', '[randomInt]1,100,test');
        engine.actionHandlers['getRandomInt'] = randomInt.actionHandler;
        let arr: number[] = [];
        for(let i = 0; i < 100; i++) {
            arr.push(<number>engine.action('getRandomInt'));
        }
        engine.storage.set('randomInt', '[randomInt]1,100,test');
        for(let i = 0; i < 100; i++) {
            Assert.strictEqual(arr[i], engine.action('getRandomInt'));
        }
    });
});