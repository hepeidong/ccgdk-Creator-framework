import { Debug } from "./Debugger";
import { GAME_NAME } from "../Define";
import { Editor } from "../editor/Editor";


var _global = typeof window === 'undefined' ? global : window;

if (!CC_EDITOR) {
    if (!_global.enable) {
        _global.enable = true;
        Editor.Dialog.closeAddChildBox();
        Debug.initDebugSetting(GAME_NAME.name);
        const classRef = cc.js.getClassByName(GAME_NAME.name) as Constructor;
        new classRef();
        Debug.log('游戏启动');
    }
}