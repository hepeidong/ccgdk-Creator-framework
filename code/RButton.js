const rcui = require('rcui');

rcui.Namespace({
    RButton: (function() {
        function RButton() {
            return {
                setSprite(spriteFrame1, spriteFrame2) {
                    if (spriteFrame1) rcui.loader.release(spriteFrame1._textureFilename);
                    spriteFrame1 = spriteFrame2;
                    if (spriteFrame1) rcui.loader.retain(spriteFrame1._textureFilename);
                },
                setNormalSprite(spriteFrame) {
                    if (!spriteFrame) {
                        throw '参数错误！参数不能为null！';
                        return;
                    }
                    this.setSprite(this.normalSprite, spriteFrame);
                },
                setPressedSprite(spriteFrame) {
                    if (!spriteFrame) {
                        throw '参数错误！参数不能为null！';
                        return;
                    }
                    this.setSprite(this.pressedSprite, spriteFrame);
                },
                setHoverSprite(spriteFrame) {
                    if (!spriteFrame) {
                        throw '参数错误！参数不能为null！';
                        return;
                    }
                    this.setSprite(this.hoverSprite, spriteFrame);
                },
                setDisabledSprite(spriteFrame) {
                    if (!spriteFrame) {
                        throw '参数错误！参数不能为null！';
                        return;
                    }
                    this.setSprite(this.disabledSprite, spriteFrame);
                },
                retain() {
                    if (this.normalSprite) rcui.loader.retain(this.normalSprite._textureFilename);
                    if (this.pressedSprite) rcui.loader.retain(this.pressedSprite._textureFilename);
                    if (this.hoverSprite) rcui.loader.retain(this.hoverSprite._textureFilename);
                    if (this.disabledSprite) rcui.loader.retain(this.disabledSprite._textureFilename);
                },
                release() {
                    if (this.normalSprite) rcui.loader.release(this.normalSprite._textureFilename);
                    if (this.pressedSprite) rcui.loader.release(this.pressedSprite._textureFilename);
                    if (this.hoverSprite) rcui.loader.release(this.hoverSprite._textureFilename);
                    if (this.disabledSprite) rcui.loader.release(this.disabledSprite._textureFilename);
                },
                onDestroy() {
                    this.release();
                }
            }
        }
        
        return RButton();
    })()
});