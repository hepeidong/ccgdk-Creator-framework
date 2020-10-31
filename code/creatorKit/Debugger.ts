

export function initDebugSetting(logTag: string): void {
    
    if (DEBUG) {
        kit.log = console.log.bind(console, timeFormat(), `${logTag ? `[${logTag}]` : ''}`);
        kit.warn = console.warn.bind(console, timeFormat(), `${logTag ? `[${logTag}]` : ''}`);
        kit.error = console.error.bind(console, timeFormat(), `${logTag ? `[${logTag}]` : ''}`);
        kit.info = console.info.bind(console, timeFormat(), `${logTag ? `[${logTag}]` : ''}`);
        kit.debug = console.debug.bind(console, timeFormat(), `${logTag ? `[${logTag}]` : ''}`);
        kit.assert = console.assert.bind(console, timeFormat(), `${logTag ? `[${logTag}]` : ''}`);

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

function timeFormat() {
    var now: Date= new Date();
    const days: string = [
        now.getFullYear().toString(),
        (now.getMonth() + 1).toString(),
        now.getDate().toString()
    ].join('-');
    const parse = (timeNum: number, len: number) => {
        const str: string = String(timeNum);
        const strLen: number = len - str.length;
        if (strLen < 0) {
            return str;
        } 
        else {
            let tempStr: string = '';
            for (let i: number = 0; i < strLen; ++i) {
                tempStr += '0';
            }
            return `${tempStr}${str}`;
        }
    }
    const times: string = [
        parse(now.getHours(), 2),
        parse(now.getMinutes(), 2),
        parse(now.getSeconds(), 2),
        parse(now.getMilliseconds(), 3)
    ].join(':');
    return `[${days} ${times}]`;
}
