
const Reference = rcui.Class({
    _referenceCount: null,
    ctor() {
        this._referenceCount = 0;
    },
    retain() {
        ++this._referenceCount;
    },
    release() {
        --this._referenceCount;
    },
    getReferenceCount() {
        return this._referenceCount;
    },
    autoReference() {

    }
});