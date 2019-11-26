export interface IViewController {
    OnViewLoaded(view: cc.Node): void;
    OnViewDidAppear(): void;
    OnViewDidHide(): void;
    OnViewDidDisappear(): void;
}