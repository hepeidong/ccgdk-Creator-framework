/**
 * 对象销毁接口
 */
export interface IDestroy {
    IsDestroyed(): boolean;
    OnDestroy(): void;
}