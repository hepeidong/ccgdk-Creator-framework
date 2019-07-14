const R = require('R');

R.Namespace({
    REditBox: (function() {
        function REditBox() {
            return {
                setBackgroundImage(backgroundImage) {
                    if (!backgroundImage) {
                        R.ErrorID(101);
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
                    R.loader.retain(this.backgroundImage._textureFilename);
                },
                release() {
                    if (!this.backgroundImage) {
                        return;
                    }
                    R.loader.release(this.backgroundImage._textureFilename);
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