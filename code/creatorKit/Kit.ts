import AdapterHelper from "./component/AdapterHelper";
import AdapterContent from "./component/AdapterContent";
import BannerAd from "./component/BannerAd";
import GuideDialogue from "./component/GuideDialogue";
import GuideFinger from "./component/GuideFinger";
import GuideText from "./component/GuideText";
import GuideHelper from "./component/GuideHelper";
import TouchHelper from "./component/TouchHelper";
import VideoAd from "./component/VideoAd";
import WindowHelper from "./component/WindowHelper";


/**
 * 游戏工具箱，定义游戏工具箱的接口类
 */

export function log(msg: any, ...subst: any[]){}
export function warn(msg: any, ...subst: any[]){}
export function error(msg: any, ...subst: any[]){}
export function debug(msg: any, ...subst: any[]){}
export function info(msg: any, ...subst: any[]){}
export function assert(condition?: boolean, msg?: string, ...data: any[]){}

export function LogID(id: number, ...subst: any[]){}
export function WarnID(id: number, ...subst: any[]){}
export function ErrorID(id: number, ...subst: any[]){}

//游戏ui系统模块
export { Controller } from "./ui_manager/Controller";
export { WindowView } from "./ui_manager/WindowView";
export { LayerManager } from "./ui_manager/LayerManager";
//游戏事件模块
export { EventListeners, Handler } from "./event_manager/EventListeners";
export { EventName } from "./event_manager/EventName";
export { TargetListener } from "./event_manager/TargetListener";
//游戏资源管理模块
export { AutoReleasePool, PoolManager } from "./res_manager/AutoReleasePool";
export { Loader } from "./res_manager/Loader";
export { Reference } from "./res_manager/Reference";
export { Resource } from "./res_manager/Resource";
export { AutoRelease } from "./res_manager/AutoRelease";
//游戏数据管理模块
export { UserDefault } from "./data_manager/UserDefault";
export { GameFileManager } from "./data_manager/GameFileManager";
//游戏常用数据结构
export { PriorityQueue } from "./data_struct/PriorityQueue";
export { Vector } from "./data_struct/Vector";
//音频，动画等游戏动效管理模块
export { Animat } from "./effect_manager/AnimatManager";
export { Audio } from "./effect_manager/AudioManager";

/*********************游戏通用功能组件*********************/
export { AdapterHelper }
export { AdapterContent }
export { BannerAd }
export { GuideDialogue }
export { GuideFinger }
export { GuideText }
export { GuideHelper }
export { TouchHelper }
export { VideoAd }
export { WindowHelper }

export function animat(target: cc.Node) { return kit.Animat.create.target(target); }
export function audio(props: IAudio) { return kit.Audio.create.audio(props); }
export function event(target: cc.Node, caller: any) { return kit.TargetListener.listener(target, caller); }