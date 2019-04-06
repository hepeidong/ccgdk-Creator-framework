/**
 * 声明命名空间和类
 */

var components;
const Rcui = (function(components) {
    
    if (window) window.rcui = components;
    components.Namespace = function(ob) {
        if (ob.name) {
            if (!this[ob.name]) {
                this[ob.name] = {};
            }
            for (let k in ob) {
                if (ob[k] != ob.name)
                    this[ob.name][k] = ob[k];
            }
            if (window) window[ob.name] = this[ob.name];
        }
        else {
            for (let k in ob) {
                this[k] = ob[k];
            }
        }
    }
    components.Class = function(obj) {
        const fuc = (function(){
            var cls;
            if (typeof obj.ctor !== 'function') {
                cls = ctor;
            }
            else {
                cls = function(){};
            }
            if (obj.extends) {
                cls = rcui.extend(cls, obj.extends);
            }
            let keys = Object.keys(obj);
            for (let i = 0; i < keys.length; ++i) {
                if (keys[i] !== obj.extends && keys[i] !== obj.singleton) {
                    cls.prototype[keys[i]] = obj[keys[i]];
                }
            }
    
            if (obj.singleton == true) {
                return new cls();
            }
            return cls;
        })();
        
        return fuc;
    }
    return components;
})(components || (components = {}));

module.exports = Rcui;