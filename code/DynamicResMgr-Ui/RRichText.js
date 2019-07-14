const R = require('R');

R.Namespace({
    RRichText: (function() {
        function RRichText() {
            return {
                setImageAtlas(imageAtlas) {
                    if (!imageAtlas) {
                        R.ErrorID(101);
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
                            R.loader.retain(this.imageAtlas._spriteFrames[keys[0]]._textureFilename);
                        }
                    }
                },
                release() {
                    if (this.imageAtlas) {
                        let keys = Object.keys(this.imageAtlas._spriteFrames);
                        if (keys.length > 0) {
                            R.loader.release(this.imageAtlas._spriteFrames[keys[0]]._textureFilename);
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