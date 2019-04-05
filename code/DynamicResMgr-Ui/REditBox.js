const rcui = require('rcui');

rcui.Namespace({
    REditBox: (function() {
        function REditBox() {
            return {
                setBackgroundImage(backgroundImage) {
                    if (!backgroundImage) {
                        rcui.Error(101);
                        return;
                    }
                    this.release();
                    this.backgroundImage = backgroundImage;
                    this.retain();
                },
                retain() {
                    if (!this.backgroundImage) {
                        return;
                    }
                    rcui.loader.retain(this.backgroundImage._textureFilename);
                },
                release() {
                    if (!this.backgroundImage) {
                        return;
                    }
                    rcui.loader.release(this.backgroundImage._textureFilename);
                },
                onDestroy() {
                    this.release();
                    this._impl.clear();
                }
            }
        }

        return REditBox();
    })()
});