/**
 * 声明命名空间
 */

var getClass = function(name) {
    if (!this[name]) {
        require(name);
    }
    return this[name];
}

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
            this[ob.name].getClass = getClass;
            if (window) window[ob.name] = this[ob.name];
        }
        else {
            for (let k in ob) {
                this[k] = ob[k];
            }
            this.getClass = getClass;
        }
    }
    return components;
})(components || (components = {}));

module.exports = Rcui;