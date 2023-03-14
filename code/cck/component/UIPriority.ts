import { Component, UITransform, _decorator } from "cc";

const {ccclass } = _decorator;

@ccclass("UIPriority")
export class UIPriority extends Component {

    private _ui: UITransform;

    public setPriority(priority: number) {
        if (!this._ui) {
            this._ui = this.getComponent(UITransform);
        }
        this._ui.priority = priority;
    }

    public getPriority() {
        if (!this._ui) {
            this._ui = this.getComponent(UITransform);
        }
        return this._ui.priority;
    }
}