const rcui = require('rcui');

rcui.Namespace({
    RMask: (function() {
        function RMask() {
            return {
                setSprite(spriteFrame) {
                    if (!spriteFrame) {
                        rcui.ErrorID(101);
                        return;
                    }
                    this.release();
                    this.spriteFrame = spriteFrame;
                    this.retain();
                },
                retain() {
                    if (!this.spriteFrame) {
                        return;
                    }
                    rcui.loader.retain(this.spriteFrame._textureFilename);
                },
                release() {
                    if (!this.spriteFrame) {
                        return;
                    }
                    rcui.loader.release(this.spriteFrame._textureFilename);
                },
                onDestroy() {
                    this.release();
                    this._super();
                    this._removeGraphics();
                }
            }
        }

        return RMask();
    })()
});