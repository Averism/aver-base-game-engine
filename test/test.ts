import * as Assert from 'assert';
import main from '../src/index';
import Engine from '../src/engine';
import { ActionInterface } from '../src/Actions';
import Storage from '../src/Storage';

const actionInterfaces: ActionInterface[] = [
    {
        name: 'setLeft',
        parameters: [
            { name: 'a', typeName: 'number', check: (value: any): value is Number => typeof value === 'number' }
        ],
        result: (value: any): value is Number => typeof value === 'number',
        resultTypeName: 'number'
    }, 
    {
        name: 'setRight',
        parameters: [
            { name: 'a', typeName: 'number', check: (value: any): value is Number => typeof value === 'number' }
        ],
        result: (value: any): value is Number => typeof value === 'number',
        resultTypeName: 'number'
    },
    {
        name: 'sum',
        parameters: [
        ],
        result: (value: any): value is Number => typeof value === 'number',
        resultTypeName: 'number'
    }
]

describe("Engine",()=>{
    it("should run simple sums",()=>{
        let engine = new Engine(actionInterfaces);
        engine.actionHandlers['setLeft'] = (v: Storage, a: number) => {
            v.set('left', a);
            return a;
        }
        engine.actionHandlers['setRight'] = (v: Storage, a: number) => {
            v.set('right', a);
            return a;
        }
        engine.actionHandlers['sum'] = (v: Storage, a: number) => {
            return (v.get('left') || 0) + (v.get('right') || 0);
        }
        Assert.strictEqual(engine.action('setLeft',1),1);
        Assert.strictEqual(engine.action('setRight',2),2);
        Assert.strictEqual(engine.action('sum'),3);
    });
});