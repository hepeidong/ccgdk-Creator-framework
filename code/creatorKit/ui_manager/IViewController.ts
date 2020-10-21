export interface IViewController {
    OnViewLoaded(): void;
    OnViewDidAppear(): void;
    OnViewDidHide(): void;
    OnViewDidDisappear(): void;
}