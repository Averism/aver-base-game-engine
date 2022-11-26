import {ActionInterface} from './Actions';
import Storage from './Storage';

export default class Engine {
    private actionInterfaces: ActionInterface[];
    actionHandlers: {[key: string]: (v: Storage, ...args: any[]) => any} = {};
    storage: Storage = new Storage();

    constructor(actionsInterface: ActionInterface[]) {
        this.actionInterfaces = actionsInterface;
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
        return result;
    }

}