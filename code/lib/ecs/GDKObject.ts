import { Utils } from "../utils/GameUtils";

export class GDKObject {
    protected _classname: string;
    constructor() {
        this._classname = 'GDKObject';
    }

    public toString(name?: string) {
        if (typeof name === 'string') {
            return Utils.StringUtil.replace(`[${this._classname}:{0}] `, name);
        }
        return Utils.StringUtil.replace(`[${this._classname}:{0}] `);
    }
}