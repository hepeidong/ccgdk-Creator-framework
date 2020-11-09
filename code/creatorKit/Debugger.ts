

export function initDebugSetting(logTag: string): void {
    
    if (DEBUG) {
        kit.log = console.log.bind(console, utils.DateUtil.dateFormat('%s-%s-%s %s:%s:%s'), `${logTag ? `[${logTag}]` : ''}`);
        kit.warn = console.warn.bind(console, utils.DateUtil.dateFormat('%s-%s-%s %s:%s:%s'), `${logTag ? `[${logTag}]` : ''}`);
        kit.error = console.error.bind(console, utils.DateUtil.dateFormat('%s-%s-%s %s:%s:%s'), `${logTag ? `[${logTag}]` : ''}`);
        kit.info = console.info.bind(console, utils.DateUtil.dateFormat('%s-%s-%s %s:%s:%s'), `${logTag ? `[${logTag}]` : ''}`);
        kit.debug = console.debug.bind(console, utils.DateUtil.dateFormat('%s-%s-%s %s:%s:%s'), `${logTag ? `[${logTag}]` : ''}`);
        kit.assert = console.assert.bind(console, utils.DateUtil.dateFormat('%s-%s-%s %s:%s:%s'), `${logTag ? `[${logTag}]` : ''}`);

        kit.LogID = genLogFunc(kit.log, 'log');
        kit.WarnID = genLogFunc(kit.warn, 'Warning');
        kit.ErrorID = genLogFunc(kit.error, 'error');
    }
}

function genLogFunc(func: Function, type: string): Function {
    return function(id: number) {
        if (DEBUG) {
            if (arguments.length === 1) {
                func(type + ': ' + kit._LogInfos[id]);
            }else {
                let argsArr: any[] = [];
                for (let i: number = 1; i < arguments.length; ++i) {
                    argsArr.push(arguments[i]);
                }

                if (arguments.length === 2) {
                    func(type + ':' + kit._LogInfos[id] + ' ' + arguments[1]);
                }
            }
        }
    }
}