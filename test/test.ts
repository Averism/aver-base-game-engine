import * as Assert from 'assert';
import Engine from '../src/engine';
import { ActionInterface } from '../src/Actions';
import Storage from '../src/Storage';
import { setSomething, sum } from './commons';

const actionInterfaces: ActionInterface[] = [
    setSomething('Left').actionInterface,
    setSomething('Right').actionInterface,
    sum.actionInterface
]

describe("Engine",()=>{
    it("should run simple sums correctly",()=>{
        let engine = new Engine(actionInterfaces);
        engine.actionHandlers['setLeft'] = setSomething('Left').actionHandler;
        engine.actionHandlers['setRight'] = setSomething('Right').actionHandler;
        engine.actionHandlers['sum'] =  sum.actionHandler;
        Assert.strictEqual(engine.action('setLeft',1),1);
        Assert.strictEqual(engine.action('setRight',2),2);
        Assert.strictEqual(engine.action('sum','Left','Right'),3);
    });
});

describe("History", () => {
    let actions;
    let history;
    function initEngine() {
        let engine = new Engine(actionInterfaces);
        engine.actionHandlers['setLeft'] = setSomething('Left').actionHandler;
        engine.actionHandlers['setRight'] = setSomething('Right').actionHandler;
        engine.actionHandlers['sum'] =  sum.actionHandler;
        return engine;
    }
    it("should be verifiable", () => {
        let engine = initEngine();
        engine.action('setLeft',1);
        engine.action('setRight',1);
        for(let i=0; i<100; i++){
            let sum = engine.action('sum','Left','Right');
            engine.action('setLeft',engine.storage.get('Right'));
            engine.action('setRight',sum);
        }
        let actions = engine.getActionHistory();
        let history = engine.storage.getStorageHistory();
        engine = initEngine();
        Assert.strictEqual(engine.verify(history,actions),true);
    })

    it("should be traceable on discrepency", () => {
        let engine = initEngine();
        engine.action('setLeft',1);
        engine.action('setRight',1);
        let untemperedActions;
        for(let i=0; i<100; i++){
            let sum = engine.action('sum','Left','Right');
            engine.action('setLeft',engine.storage.get('Right'));
            engine.action('setRight',sum);
            if(i==50){
                untemperedActions = engine.getActionHistory();
                engine.storage.set('Right',0);
            }
        }
        let actions = engine.getActionHistory();
        let history = engine.storage.getStorageHistory();
        engine = initEngine();
        Assert.strictEqual(engine.verify(history,actions),false);
        engine = initEngine();
        let verifiedActions = engine.traceDiscrepancy(history,actions);
        Assert.strictEqual(verifiedActions,untemperedActions);
        Assert.strictEqual(verifiedActions.split('\n').length, 3*51 /* 3 action of sum, setleft, set right, per iteration */ + 2 /* 2 actions of init */);
    });
});