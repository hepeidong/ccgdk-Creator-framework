import { Vec3 } from "cc";

export enum BulletType {
    HERO_BULLET,
    ENEMY_BULLET
}

export type BulletData = {worldPos: Vec3, type: BulletType, time: number, toPos: Vec3}

export enum ColliderGroup {
    DEFAULT,
    HERO,
    ENEMY,
    HERO_BULLET,
    ENEMY_BULLET
}