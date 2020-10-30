export interface IViewController {
    onViewLoaded(): void;
    onViewDidAppear(): void;
    onViewDidHide(): void;
    onViewDidDisappear(): void;
}