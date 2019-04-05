const rcui = require('rcui');

rcui.Namespace({
    RSprite: (function() {
        function RSprite() {
            return {
                setSprite(spriteFrame) {
                    if (!spriteFrame) {
                        rcui.Error(101);
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

                    if (this.__superOnDestroy) this.__superOnDestroy();
                    this.node.off(cc.Node.EventType.SIZE_CHANGED, this._resized, this);
                }
            }
        }

        return RSprite();
    })()
});