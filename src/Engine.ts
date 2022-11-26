export default class Engine {
    action: any;

    constructor(actionInterface: any) {
        let handler: ProxyHandler<any> = {
            apply: (target: any, thisArg: any, argArray: any[]) => {
                return target.apply(thisArg, argArray);
            }
        }
        this.action = new Proxy(actionInterface, handler);
    }
}