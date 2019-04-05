const rcui = require('rcui');

rcui.Namespace({
    RLabel: (function() {
        function RLabel() {
            return {
                setFont(font) {
                    if (!font) {
                        rcui.ErrorID(101);
                        return;
                    }
                    if (font instanceof cc.BitmapFont) {
                        this.release();
                    }
                    this.font = font;
                    this.retain();
                },
                retain() {
                    if (!this.font instanceof cc.BitmapFont) {
                        return;
                    }
                    rcui.loader.retain(this.font.spriteFrame._textureFilename);
                },
                release() {
                    if (!this.font instanceof cc.BitmapFont) {
                        return;
                    }
                    rcui.loader.release(this.font.spriteFrame._textureFilename);
                },
                onDestroy() {
                    this.release();
                    this._assembler && this._assembler._resetAssemblerData && this._assembler._resetAssemblerData(this._assemblerData);
                    this._assemblerData = null;
                    this._letterTexture = null;
                    if (this._ttfTexture) {
                        this._ttfTexture.destroy();
                        this._ttfTexture = null;
                    }
                    this._super();
                }
            }
        }

        return RLabel();
    })()
});