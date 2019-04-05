const rcui = require('rcui');

rcui.Namespace({
    RPartcleSystem: (function() {
        function RPartcleSystem() {
            return {
                retain() {
                    if (!this._texture) {
                        return;
                    }
                    rcui.loader.retain(this._texture);
                },
                release() {
                    if (!this._texture) {
                        return;
                    }
                    rcui.loader.release(this._texture);
                },
                onDestroy() {
                    this.release();
                    if (this.autoRemoveOnFinish) {
                        this.autoRemoveOnFinish = false;    // already removed
                    }
                    this._super();
                }
            }
        }

        return RPartcleSystem();
    })()
});