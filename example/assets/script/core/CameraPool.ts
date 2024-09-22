import { Camera } from "cc";

export class CameraPool {
    private _moveCameras: Camera[];
    private constructor() {
        this._moveCameras = [];
    }

    private static _ins: CameraPool;
    public static get instance() {
        if (!this._ins) {
            this._ins = new CameraPool();
        }
        return this._ins;
    }

    public get moveCameras() {
        return this._moveCameras;
    }

    public addMoveCamera(camera: Camera) {
        for (const c of this._moveCameras) {
            if (c.node.name === camera.node.name) {
                return;
            }
        }
        this._moveCameras.push(camera);
    }

    public removeMoveCameraAll() {
        this._moveCameras = null;
        this._moveCameras = [];
    }
}