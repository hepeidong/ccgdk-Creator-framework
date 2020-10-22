

/**
 * 游戏工具箱，定义游戏工具箱的接口类
 */

export function Log(msg: any, ...subst: any[]){}
export function Warn(msg: any, ...subst: any[]){}
export function Error(msg: any, ...subst: any[]){}
export function Debug(msg: any, ...subst: any[]){}
export function Info(msg: any, ...subst: any[]){}
export function LogID(id: number, ...subst: any[]){}
export function WarnID(id: number, ...subst: any[]){}
export function ErrorID(id: number, ...subst: any[]){}

export { Controller } from "./ui_manager/Controller";
export { WindowView } from "./ui_manager/WindowView";
export { LayerManager } from "./ui_manager/LayerManager";
export { EventListeners, Handler } from "./event_manager/EventListeners";
export { EventName } from "./event_manager/EventName";
export { AutoReleasePool, PoolManager } from "./res_manager/AutoReleasePool";
export { Loader } from "./res_manager/Loader";
export { Reference } from "./res_manager/Reference";
export { Resource } from "./res_manager/Resource";
export { PriorityQueue } from "./data_struct/PriorityQueue";
export { UserDefault } from "./data_manager/UserDefault";
export { Vector } from "./data_struct/Vector";
export { AutoRelease } from "./res_manager/AutoRelease";
export { TargetListener } from "./event_manager/TargetListener";
export { GameFileManager } from "./data_manager/GameFileManager";
export { Animat } from "./dyn_effect_manager/AnimatManager";
export { Audio } from "./dyn_effect_manager/AudioManager";
