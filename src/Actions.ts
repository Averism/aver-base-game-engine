
export type ParamTypeCheck<T> = (value: any) => value is T;

export type Parameter<T> = {
    name: string;
    typeName: string;
    check: ParamTypeCheck<T>;
    optional?: boolean;
    defaultValue?: T;
};

export type ActionInterface = {
    name: string;
    parameters: Parameter<any>[];
    result: ParamTypeCheck<any>;
    resultTypeName: string;
}

export function makeInterface(actions: ActionInterface[], interfaceName: string): string {
    let result = '';
    result += `export interface ${interfaceName} {\n`;
    for(let action of actions) {
        let parameters = action.parameters.map(param => { 
            if(param.defaultValue) return `${param.name}: ${param.typeName} = ${JSON.stringify(param.defaultValue)}`;
            let optional = param.optional ? '?' : '';
            return `${param.name}${optional}: ${param.typeName}`;
        }).join(', ');
        result += `${action.name}(${parameters}): ${action.resultTypeName};\n`;
    }
    result += '}\n';
    return result;
}