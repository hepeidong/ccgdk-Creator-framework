const rcui = require('rcui');

rcui.Namespace({
    loader: (function() {
        let _progressCallback = null;
        let _completeCallback = null;
        let _sceneRefCount = null;
        //自动释放池
        let _autoReleasePool = {};
        function loader() {
            const components = {
                //资源引用的时机
                Opportunity: {
                    SINGLE_USE: 0,//一次性使用
                    CURR_SCENE: 1,//当前场景
                    NEXT_SCENE: 2,//下一个场景
                    PERPETUITY: 100//永久
                },

                /**
                 * 引用计数加一
                 * @param {string} url 
                 */
                retain: function (url) {
                    if (cc.loader['_cache'][url]._refCount == null) {
                        _initRefCount(url);
                        cc.loader['_cache'][url]._sceneRefCount = this.Opportunity.SINGLE_USE;
                    }
                    cc.loader['_cache'][url]._refCount++;
                },

                /**
                 * 引用计数减一
                 * @param {string} url 
                 */
                release: function (url) {
                    if (cc.loader['_cache'][url]._refCount == null) {
                        _initRefCount(url);
                        cc.loader['_cache'][asset.url]._sceneRefCount = this.Opportunity.SINGLE_USE;
                    }
                    else {
                        cc.loader['_cache'][url]._refCount--;
                    }
                    if (cc.loader['_cache'][url]._refCount <= 0 && cc.loader['_cache'][url]._sceneRefCount <= 0) {
                        _releaseRes(url);
                    }
                },

                releasePermanentRes: function () {
                    for (let asset in _autoReleasePool) {
                        if (_autoReleasePool[asset]._sceneRefCount >= 10) {
                            _autoReleasePool[asset]._sceneRefCount = 0;
                        }
                    }
                    _releaseResAll();
                },

                /**
                 * 初始化预制体
                 * @param {cc.Prefab} prefab 
                 * @param {cc.Node} target 
                 * @param {Function} callback 
                 */
                instanitate: function (prefab, target, callback) {
                    if (!prefab) {
                        throw `[参数] 错误 ${prefab}`;
                    }
                    let pre_node = cc.instantiate(prefab);
                    target && target.addChild(pre_node);
                    callback && callback(pre_node);
                    this.addNode(pre_node);
                },
                addNode: function (node) {
                    let children = node.children;
                    this.parserNode(node);
                    children.forEach(child => {
                        this.addNode(child);
                        this.parserNode(child);
                    });
                },
                parserNode: function (node) {
                    let sprite = node.getComponent(cc.Sprite);
                    _addUiFunction(sprite, rcui.RSprite);

                    let button = node.getComponent(cc.Button);
                    _addUiFunction(button, rcui.RButton);

                    // let label = node.getComponent(cc.Label);
                    // _addUiFunction(label, rcui.RLabel);

                    // let sprite = node.getComponent(cc.Sprite);
                    // _addUiFunction(sprite, rcui.RSprite);
                },
                load: function (url, callback, oppor) {
                    cc.loader.load(url, (err, asset) => {
                        if (err) {
                            throw `[加载资源] ${err}`;
                            return;
                        }
                        _initRefCount(asset.url);
                        cc.loader['_cache'][asset.url]._sceneRefCount = oppor;
                        callback && callback(asset);
                    });
                },
                loadRes: function (url, callback, oppor) {
                    cc.loader.loadRes(url, (err, asset) => {
                        if (err) {
                            throw `[加载资源] ${err}`;
                            return;
                        }
                        _initRefCount(asset.url);
                        cc.loader['_cache'][asset.url]._sceneRefCount = oppor;
                        callback && callback(asset);
                    });
                },
                loadResDir: function (url, callback, oppor) {
                    cc.loader.loadResDir(url, (err, assets) => {
                        if (err) {
                            throw `[加载资源] ${err}`;
                            return;
                        }
                        for (let i = 0; i < assets.length; ++i) {
                            if (typeof assets == 'string') {
                                _initRefCount(assets[i]);
                                cc.loader['_cache'][assets[i]]._sceneRefCount = oppor;
                            }
                            else if (assets[i].url) {
                                _initRefCount(assets[i].url);
                                cc.loader['_cache'][assets[i].url]._sceneRefCount = oppor;
                            }
                        }
                        callback && callback(assets);
                    });
                }
            }
            
           return components;
        }
        function _init() {
            _overloadFunc();
            // cc.director.on(cc.Director.EVENT_AFTER_UPDATE, _afterUpdate);//update后
            cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, _beforeSceneLoading);//场景加载前
            cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, _beforeSceneLaunch);//场景运行前
            cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, _afterSceneLaunch);//场景运行后
            return true;
        }

        function _initRefCount(url) {
            if (cc.loader['_cache'][url]._refCount == null) {
                cc.loader['_cache'][url]._refCount = 0;
                _autoReleasePool[url] = cc.loader['_cache'][url];
            }
            else if (cc.loader['_cache'][url]._refCount <= 0) {
                cc.loader['_cache'][url]._refCount = 0;
            }
        }

        function _afterUpdate() {
            // console.log('update 后');
        }

        function _beforeSceneLoading() {
            // console.log('加载前');
            for (let asset in _autoReleasePool) {
                _autoReleasePool[asset]._sceneRefCount--;
            }
            _releaseResAll();
        }

        function _beforeSceneLaunch(event, detail) {
            // console.log('运行前');
            
        }

        function _afterSceneLaunch() {
            // console.log('运行后');
        }

        function _releaseRes(url) {
            let releaseAssets = [];
            let dependKeys = {};
            for (let k in cc.loader['_cache']) {
                if (cc.loader['_cache'][k].dependKeys && cc.loader['_cache'][k].dependKeys.length > 0) {
                    dependKeys[k] = cc.loader['_cache'][k].dependKeys;
                }
            }

            if (_autoReleasePool[url]._refCount <= 0) {
                cc.loader.release(_autoReleasePool[url].url);
                releaseAssets.push(_autoReleasePool[url].url);
                _clear(_autoReleasePool, url);

                _releaseDependAsset(releaseAssets, dependKeys);
            }
        }

        function _releaseResAll() {
            let releaseAssets = [];
            let dependKeys = {};
            for (let k in cc.loader['_cache']) {
                if (cc.loader['_cache'][k].dependKeys && cc.loader['_cache'][k].dependKeys.length > 0) {
                    dependKeys[k] = cc.loader['_cache'][k].dependKeys;
                }
            }
            for (let asset in _autoReleasePool) {
                if (_autoReleasePool[asset]._refCount <= 0 && _autoReleasePool[asset]._sceneRefCount <= 0) {
                    cc.loader.release(_autoReleasePool[asset].url);
                    releaseAssets.push(_autoReleasePool[asset].url);
                    _clear(_autoReleasePool, asset);
                }

                _releaseDependAsset(releaseAssets, dependKeys);
            }
        }

        function _releaseDependAsset(releaseAssets, dependKeys) {
            let releaseJsonAssets = [];
            for (let dep_k in dependKeys) {
                let isRelease = false;
                for (let i = 0; i < dependKeys.length; ++i) {
                    if (releaseAssets.indexOf(dependKeys[i]) !== -1) {
                        cc.loader.release(cc.loader['_cache'][dep_k].url);
                        releaseJsonAssets.push(cc.loader['_cache'][dep_k].url);
                        isRelease = true;
                    }
                }
                if (isRelease) _clear(dependKeys, dep_k);
            }

            for (let dep_k in dependKeys) {
                let isRelease = false;
                for (let i = 0; i < dependKeys.length; ++i) {
                    if (releaseJsonAssets.indexOf(dependKeys[i]) !== -1) {
                        cc.loader.release(cc.loader['_cache'][dep_k].url);
                        isRelease = true;
                    }
                }
                if (isRelease) _clear(dependKeys, dep_k);
            }
        }

        function _clear(obj, key) {
            if (obj[key]) delete obj[key];
        }

        function _addUiFunction(component, ui) {
            for (let k in ui) {
                component[k] = ui[k];
            }
            component.retain();
        }

        function _addMethod(object, name, func) {
            let old = object[name];
            object[name] = function () {
                //函数的参数列表的参数个数是否等于实际接收到的参数个数
                if (func.length == arguments.length) {
                    return func.apply(this, arguments);
                }
                else if (typeof old == 'Function') {
                    return old.apply(this, arguments);
                }
            }
        }

        function _overloadFunc() {
            _addMethod(loader, 'load', function(url, progressCallback, completeCallback, oppor) {
                _progressCallback = progressCallback;
                _completeCallback = completeCallback;
                _sceneRefCount = oppor;
                cc.loader.load(url, type, proCallback, comCallback);
            });
            _addMethod(loader, 'loadRes', function(url, type, callback, oppor) {
                cc.loader.loadRes(url, type, (err, asset) => {
                    if (err) {
                        throw `[加在资源] ${err}`;
                        return;
                    }
                    _initRefCount(asset.url);
                    cc.loader['_cache'][asset.url]._sceneRefCount = oppor;
                    callback && callback(asset);
                });
            });
            _addMethod(loader, 'loadResDir', function(url, type, callback, oppor) {
                cc.loader.loadRes(url, type, (err, assets) => {
                    if (err) {
                        throw `[加在资源] ${err}`;
                        return;
                    }
                    for (let i = 0; i < assets.length; ++i) {
                        if (typeof assets[i] == 'string') {
                            _initRefCount(assets[i]);
                            cc.loader['_cache'][assets[i]]._sceneRefCount = oppor;
                        }
                        else if (assets[i].url) {
                            _initRefCount(assets[i].url);
                            cc.loader['_cache'][assets[i].url]._sceneRefCount = oppor;
                        }
                    }
                    callback && callback(asset);
                });
            });
            _addMethod(loader, 'loadResDir', function(url, progressCallback, completeCallback, oppor) {
                _progressCallback = progressCallback;
                _completeCallback = completeCallback;
                _sceneRefCount = oppor;
                cc.loader.loadRes(url, type, proCallback, comCallback);
            });
        }

        function _proCallback(completedCount, totalCount, item) {
            if (typeof item == 'string') {
                _initRefCount(item);
                cc.loader['_cache'][item]._sceneRefCount = _sceneRefCount;
            }
            else if (item.url) {
                _initRefCount(item.url);
                cc.loader['_cache'][item.url]._sceneRefCount = _sceneRefCount;
            }
            _progressCallback && _progressCallback(completedCount, totalCount, item);
        }
        
        function _comCallback(err, assets) {
            if (err) {
                throw `[加在资源] ${err}`;
                return;
            }
            _completeCallback && _completeCallback(assets);
        }

        let component = loader();
        if (!_init()) {
            component = null;
        }
        return component;
    })()
});