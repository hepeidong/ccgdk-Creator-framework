const R = require('R');
// R.getClass('ErrorID');
R.Namespace({
    RButton: (function() {
        function RButton() {
            return {
                setSprite(spriteFrame1, spriteFrame2) {
                    if (spriteFrame1) R.loader.release(spriteFrame1._textureFilename);
                    spriteFrame1 = spriteFrame2;
                    if (spriteFrame1) R.loader.retain(spriteFrame1._textureFilename);
                },
                setNormalSprite(spriteFrame) {
                    if (!spriteFrame) {
                        R.ErrorID(101);
                        return;
                    }
                    this.setSprite(this.normalSprite, spriteFrame);
                },
                setPressedSprite(spriteFrame) {
                    if (!spriteFrame) {
                        R.ErrorID(101);
                        return;
                    }
                    this.setSprite(this.pressedSprite, spriteFrame);
                },
                setHoverSprite(spriteFrame) {
                    if (!spriteFrame) {
                        R.ErrorID(101);
                        return;
                    }
                    this.setSprite(this.hoverSprite, spriteFrame);
                },
                setDisabledSprite(spriteFrame) {
                    if (!spriteFrame) {
                        R.ErrorID(101);
                        return;
                    }
                    this.setSprite(this.disabledSprite, spriteFrame);
                },
                retain() {
                    if (this.normalSprite) R.loader.retain(this.normalSprite._textureFilename);
                    if (this.pressedSprite) R.loader.retain(this.pressedSprite._textureFilename);
                    if (this.hoverSprite) R.loader.retain(this.hoverSprite._textureFilename);
                    if (this.disabledSprite) R.loader.retain(this.disabledSprite._textureFilename);
                },
                release() {
                    if (this.normalSprite) R.loader.release(this.normalSprite._textureFilename);
                    if (this.pressedSprite) R.loader.release(this.pressedSprite._textureFilename);
                    if (this.hoverSprite) R.loader.release(this.hoverSprite._textureFilename);
                    if (this.disabledSprite) R.loader.release(this.disabledSprite._textureFilename);
                },
                onDestroy() {
                    this.release();
                }
            }
        }
        
        return RButton();
    })()
});