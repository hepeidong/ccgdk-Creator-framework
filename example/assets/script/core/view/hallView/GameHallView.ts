import { _decorator, Component, Node } from 'cc';
import { app, Debug, ui } from '../../../cck';
import { SceneEnum } from '../../SceneEnum';
import { UIEnum } from '../../UIEnum';
const { ccclass, property } = _decorator;

@ccclass('GameHallView')
export class GameHallView extends ui.WinView {

    @property(Node)
    private bg: Node = null;

    start() {

    }

    public showBg(node: Node) {
        this.bg.addChild(node);
    }

    onStartBattle() {
        app.game.sceneManager.setScene(SceneEnum.InterimScene, UIEnum.GameBattle, SceneEnum.BattleScene);
    }

    update(deltaTime: number) {
        
    }
}


