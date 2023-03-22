import { IBaseEntity, ISystem } from "../lib.cck";
import { ConversionSystem } from "./ConversionSystem";

type JobMethod<T> = (entity: T, conversionSystem: ConversionSystem) => void;

export class JobHandler<T extends IBaseEntity> {
    private _method: JobMethod<T>;
    private constructor(method: JobMethod<T>) {
        this._method = method;
    }

    public static create(method: JobMethod<IBaseEntity>) {
        return new JobHandler(method);
    }

    public apply(thisArg: ISystem) {
        return this._method.apply(thisArg);
    }
}