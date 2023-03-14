import { Node, resources } from "cc";
import { Animat } from "./AnimatManager";
import { Audio } from "./AudioManager";

 /**
     * 动画播放和管理模块，可以实现多个动画顺序播放，会创建Animat对象。
     * 此函数有两个参数，第一个参数是挂载动画的节点，第二个是动画资源所在的资源包，如果是动态加载资源，则需要从这个资源包中加载，
     * 默认是resources资源包
     * @param target 
     * @param bundle 
     * @returns 
     */
 export function animat(target: Node, bundle: string = resources.name) {
    return Animat.create(bundle).target(target);
}

/**
 * 音频播放和管理的模块，可以实现多个音频顺序播放，会创建一个Audio对象，此Audio类不是引擎的Audio类，要注意区分。
 * 此函数需要传入一个音频资源所在资源包名或资源包路径，默认是resources资源包
 * @param bundle 
 * @returns 
 */
export function audio(bundle: string = resources.name) {
    return Audio.create(bundle);
}

export * from "./AnimatManager";
export * from "./AudioManager";