import {ActionInterface} from './Actions';
import Storage from './Storage';

export default class Engine {
    private actionInterfaces: ActionInterface[];
    actionHandlers: {[key: string]: (v: Storage, ...args: any[]) => any};
    storage: Storage;
    actionHistory: string[];

    private serializeAction(actionName: string, ...args: any[]) {
        return [actionName, ...(args.map(x=>JSON.stringify(x)))].map(x=>Buffer.from(x).toString('base64')).join(',');
    }

    constructor(actionsInterface: ActionInterface[]) {
        this.actionInterfaces = actionsInterface;
        this.actionHandlers = {};
        this.storage = new Storage();
        this.actionHistory = [];
    }

    private parseActionList(actionListB64String: string): string[][] {
        let actionListB64List = actionListB64String.split('\n');
        return actionListB64List.map(actionRowB64 => 
            actionRowB64.split(',').map(actionB64 => Buffer.from(actionB64, 'base64').toString('utf8'))
            );
    }

    getActionHistory(): string {
        return this.actionHistory.join('\n');
    }

    verify(hash: string, actionListB64String: string) : boolean{
        for(let actionRow of this.parseActionList(actionListB64String)) {
            let actionName = actionRow.shift();
            let actionParameters = actionRow.map(param => JSON.parse(param));
            this.action(actionName, ...actionParameters);
        }
        return this.storage.verifyHistory(hash);
    }

    traceDiscrepancy(hash: string, actionListB64String: string): string {
        let actionList = this.parseActionList(actionListB64String);
        this.storage.startTraceHistoryDiscrepancy(hash);
        for(let actionRow of actionList) {
            let actionName = actionRow.shift();
            let actionParameters = actionRow.map(param => JSON.parse(param));
            try{
                this.action(actionName, ...actionParameters);
            }catch(e) {
                console.log(`discrepancy found at action ${actionName}(${actionParameters.join(',')})`);
                this.actionHistory.pop();
                return this.getActionHistory();
            }
        }
        return this.getActionHistory();
    }

    action(actionName: string, ...args: any[]) {
        let actionInterface = this.actionInterfaces.find(action => action.name === actionName);
        if(!actionInterface) throw new Error(`Action ${actionName} not found`);
        if(!this.actionHandlers[actionName]) throw new Error(`Action ${actionName} not implemented`);
        for(let i = 0; i < args.length; i++) {
            if(!actionInterface.parameters[i]) throw new Error(`Action ${actionName} should not have parameter ${i}`);
            if(!actionInterface.parameters[i].check(args[i])) {
                throw new Error('Invalid parameter type');
            }
        }
        let result:any = this.actionHandlers[actionName].apply(null, [this.storage, ...args]);
        if(!actionInterface.result(result)) {
            throw new Error('Invalid result type '+JSON.stringify(result));
        }
        this.actionHistory.push(this.serializeAction(actionName, ...args));
        return result;
    }

}