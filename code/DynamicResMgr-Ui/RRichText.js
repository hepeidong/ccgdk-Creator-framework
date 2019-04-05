const rcui = require('rcui');

rcui.Namespace({
    RRichText: (function() {
        function RRichText() {
            return {
                setImageAtlas(imageAtlas) {
                    if (!imageAtlas) {
                        rcui.Error(101);
                        return;
                    }
                    this.release();
                    this.imageAtlas = imageAtlas;
                    this.retain();
                },
                retain() {
                    if (this.imageAtlas) {
                        let keys = Object.keys(this.imageAtlas._spriteFrames);
                        if (keys.length > 0) {
                            rcui.loader.retain(this.imageAtlas._spriteFrames[keys[0]]._textureFilename);
                        }
                    }
                },
                release() {
                    if (this.imageAtlas) {
                        let keys = Object.keys(this.imageAtlas._spriteFrames);
                        if (keys.length > 0) {
                            rcui.loader.release(this.imageAtlas._spriteFrames[keys[0]]._textureFilename);
                        }
                    }
                },
                onDestroy() {
                    this.release();
                    for (let i = 0; i < this._labelSegments.length; ++i) {
                        this._labelSegments[i].removeFromParent();
                        pool.put(this._labelSegments[i]);
                    }
                }
            }
        }

        return RRichText();
    })()
});