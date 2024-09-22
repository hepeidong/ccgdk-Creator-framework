import { _decorator, Component, Node } from 'cc';
import { app, ui } from '../../../cck';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameEndView')
export class GameEndView extends ui.WinView {

    @property(Label)
    tip: Label = null;

    start() {

    }

    onClick() {
        app.game.sceneManager.backScene();
    }

    update(deltaTime: number) {
        
    }
}


