import { CCK_DEBUG } from "./Define";
import { Utils } from "./utils/GameUtils";


export class Debug {
    static log = function log(msg: any, ...subst: any[]){}
    static warn = function warn(msg: any, ...subst: any[]){}
    static error = function error(msg: any, ...subst: any[]){}
    static debug = function debug(msg: any, ...subst: any[]){}
    static info = function info(msg: any, ...subst: any[]){}
    static assert = function assert(condition?: boolean, ...data: any[]){}

    static initDebugSetting(logTag: string): void {
        if (CCK_DEBUG) {
            this.log = console.log.bind(console, Utils.StringUtil.logFormat(logTag, 'LOG'));
            this.warn = console.warn.bind(console, Utils.StringUtil.logFormat(logTag, 'WARN'));
            this.error = console.error.bind(console, Utils.StringUtil.logFormat(logTag, 'ERROR'));
            this.info = console.info.bind(console, Utils.StringUtil.logFormat(logTag, 'INFO'));
            this.debug = console.debug.bind(console, Utils.StringUtil.logFormat(logTag, 'KIT_DEBUG'));
            this.assert = console.assert.bind(console, Utils.StringUtil.logFormat(logTag, 'ASSERT'));
        }
    }
}