const R = require('R');

R.Namespace({
    RPartcleSystem: (function() {
        function RPartcleSystem() {
            return {
                retain() {
                    if (!this._texture) {
                        return;
                    }
                    R.loader.retain(this._texture);
                },
                release() {
                    if (!this._texture) {
                        return;
                    }
                    R.loader.release(this._texture);
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