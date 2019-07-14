
const PoolManager = R.Class({
    _releasePoolStack: null,
    ctor() {
        this._releasePoolStack = [];
    },

    static: {
        _singleInstance: null,
        get Instance() {
            return this._singleInstance || (this._singleInstance = new PoolManager());
        }
    },

    purgePoolManager() {
        this.destroyPoolManager();
    },

    destroyPoolManager() {
        delete PoolManager._singleInstance;
        PoolManager._singleInstance = null;
    },

    getCurrentPool() {

    },

    isObjectInPools() {

    },

    _push(pool) {

    },

    _pop() {

    }
});

const AutoReleasePool = R.Class({
    _managedObjectArray: null,
    _isClearing: null,
    ctor() {
        this._managedObjectArray = [];
        this._isClearing = false;
    },
    addObject(obj) {
       this. _managedObjectArray.push(obj);
    },
    clear() {
        this._isClearing = true;
    },
    contains(obj) {
        if (this._managedObjectArray.indexOf() !== -1) {
            return true;
        }
        return false;
    },
    isClearing() {
        return this._isClearing;
    }
});