import { Reference} from "./res_manager/Reference";
import { PoolManager,AutoReleasePool } from "./res_manager/AutoReleasePool";
import { EventListeners,Handler } from "./event_manager/EventListeners";
import { RootViewController } from "./ui_manager/RootViewController";
import { Controller } from "./ui_manager/Controller";
import { UIViewController } from "./ui_manager/UIViewController";
import { LayerManager } from "./ui_manager/LayerManager";
import { WindowView } from "./ui_manager/WindowView";
import { EventName } from "./event_manager/EventName";
import { Resource } from "./res_manager/Resource";
import { PriorityQueue } from "./data_manager/PriorityQueue";
import { Vector } from "./data_manager/Vector";
import { UILoader } from "./res_manager/Loader";
import { UserDefault } from "./data_manager/UserDefault";


export function initFrame(): void {
    var cf = {
        _LogInfos: {},
        Log: function(){},
        Warn: function(){},
        Error: function(){},
        Info: function(){},
        Debug: function(){},
        LogID: function(){},
        WarnID: function(){},
        ErrorID: function(){},
        Reference: Reference,
        EventName: EventName,
        EventListeners: EventListeners,
        Handler: Handler,
        Resource: Resource,
        PriorityQueue: PriorityQueue,
        Vector: Vector,
        UILoader: UILoader,
        PoolManager: PoolManager,
        AutoReleasePool: AutoReleasePool,
        RootViewController: RootViewController,
        UIControl: Controller,
        UIViewController: UIViewController,
        LayerManager: LayerManager,
        WindowView: WindowView,
        UserDefault: UserDefault
    };
    define('cf', cf);
}

