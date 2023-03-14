import { utils } from "../utils";

export class GDKObject {
    protected _classname: string;
    constructor() {
        this._classname = 'GDKObject';
    }

    public toString(name?: string) {
        if (typeof name === 'string') {
            return utils.StringUtil.replace(`[${this._classname}:{0}] `, name);
        }
        return utils.StringUtil.replace(`[${this._classname}:{0}] `);
    }
}