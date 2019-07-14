const R = require('R');

R.Namespace({
    RMask: (function() {
        function RMask() {
            return {
                setSprite(spriteFrame) {
                    if (!spriteFrame) {
                        R.ErrorID(101);
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
                    R.loader.retain(this.spriteFrame._textureFilename);
                },
                release() {
                    if (!this.spriteFrame) {
                        return;
                    }
                    R.loader.release(this.spriteFrame._textureFilename);
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