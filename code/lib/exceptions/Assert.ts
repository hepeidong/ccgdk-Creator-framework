import { Debug } from "../cck/Debugger";
import { Exception } from "./Exception";

export class Assert {
    constructor() {
        
    }

    private static _ins: Assert = null;
    public static get instance() { 
        if (!this._ins) {
            this._ins = new Assert();
        }
        return this._ins;
     }

    public handle(exceptionType: string, object: any, message?: string) {
        try {
            const exception = this.getException(exceptionType, object, message);
            return exception.handle();
        } catch (error) {
            Debug.error(error);
        }
    }

    private getException(exceptionType: string, object: any, message?: string) {
        const exceptionRef = cc.js.getClassByName(exceptionType) as Constructor;
        const exception = new exceptionRef(message, object);
        return exception as Exception;
    }
}


export namespace Assert {
    export enum Type {
        GetModelClassException = "GetModelClassException",
        GetHttpMessageClassException = "GetHttpMessageClassException",
        GetSocketMessageClassException = "GetSocketMessageClassException",
        GetWindowFormClassException = "GetWindowFormClassException",
        GetSceneClassException = "GetSceneClassException",
        GetCommandClassException = "GetCommandClassException",
        GetComponentException = "GetComponentException",
        InitSceneTypeException = "InitSceneTypeException",
        InitViewTypeException = "InitViewTypeException",
        LoadSceneException = "LoadSceneException",
        LoadAssetBundleException = "LoadAssetBundleException",
        CreateObjectException = "CreateObjectException",
        InsertEdgeException = "InsertEdgeException",
        DeleteEdgeException = "DeleteEdgeException",
        DeleteVertexException = "DeleteVertexException",
        LoadRemoteTextureException = "LoadRemoteTextureException",
        ToastManagerException = "ToastManagerException",
        GetObserverClassException = "GetObserverClassException",
        FindRedDotException = "FindRedDotException",
        RedDotAlreadyExistsException = "RedDotAlreadyExistsException"
    }
}
