const rcui = require('rcui');

rcui.Namespace({
    RPageViewIndicator: (function() {
        function RPageViewIndicator() {
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
                }
            }
        }

        return RPageViewIndicator();
    })()
});