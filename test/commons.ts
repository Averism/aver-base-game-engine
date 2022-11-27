import { ActionInterface } from "../src/Actions";
import Storage from "../src/Storage";

export const randomInt: { actionInterface: ActionInterface, actionHandler: (v: Storage, ...args: any[]) => any } = {
    actionInterface: {
        name: 'getRandomInt',
        parameters: [],
        result: (value: any): value is Number => typeof value === 'number',
        resultTypeName: 'number'
    },
    actionHandler: (v: Storage) => {
        return v.get('randomInt');
    }
}

export const setSomething: (something: string) => { actionInterface: ActionInterface, actionHandler: (v: Storage, ...args: any[]) => any } = (something: string) => {
    return {
        actionInterface: {
            name: 'set' + something,
            parameters: [
                { name: 'a', typeName: 'number', check: (value: any): value is Number => typeof value === 'number' }
            ],
            result: (value: any): value is Number => typeof value === 'number',
            resultTypeName: 'number'
        },
        actionHandler: (v: Storage, a: number) => {
            v.set(something, a);
            return a;
        }
    }
}


export const sum: { actionInterface: ActionInterface, actionHandler: (v: Storage, ...args: any[]) => any } = {
    actionInterface: {
        name: 'sum',
        parameters: [
            { name: 'a', typeName: 'string', check: (value: any): value is string => typeof value === 'string' },
            { name: 'b', typeName: 'string', check: (value: any): value is string => typeof value === 'string' },
        ],
        result: (value: any): value is Number => typeof value === 'number',
        resultTypeName: 'number'
    },
    actionHandler: (v: Storage, a: string, b: string) => {
        return (v.get(a) || 0) + (v.get(b) || 0);
    }
}