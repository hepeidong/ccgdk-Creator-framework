import { Component } from "cc";
import { IWinView } from "../lib.cck";
import { Assert } from "../exceptions/Assert";
import { CCWinView } from "./CCWinView";
import { WindowBase } from "./WindowBase";
import { WindowManager } from "./WindowManager";
import { app } from "../app";


export class CCWinForm<T extends IWinView> extends WindowBase<T> {
    constructor(accessId: string) {
        super(accessId);
    }

    protected showWait() {
        app.game.sceneManager.showWaitView();
    }

    protected closeWait() {
        app.game.sceneManager.hideWaitView();
    }

    protected _loadView() {
        this.initViewComponent();
        this.addListener(this.viewComponent);
    }

    protected _openView() {
        this.view.popup();
    }

    protected _closeView() {
        this.view.close();
    }

    private initViewComponent() {
        const components = this.node.getComponents(Component);
        for (const component of components) {
            if (component instanceof CCWinView) {
                this.setViewComponent(component);
                return;
            }
        }
        Assert.instance.handle(Assert.Type.GetComponentException, null, "WinView");
    }

    private addListener(gameUI: IWinView) {
        if (this.winModel === "DIALOG" || this.winModel === "ACTIVITY") {
            gameUI.setPopupSpring();
        }

        gameUI.setStartListener(() => {
            this.popupView();
            if (this.winModel === "TOAST") {
                WindowManager.instance.delView(this.getViewType(), false);
            }
        }, this);
        gameUI.setCompleteListener(() => {
            this.removeView();
            WindowManager.instance.exitView(this);
        }, this);
        if (this.winModel !== "TOAST") {
            gameUI.setBackBtnListener(() => WindowManager.instance.delView(this.getViewType(), false));
        }
    }
}