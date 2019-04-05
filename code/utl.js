const rcui = require('rcui');

rcui.Namespace({
    utl: {
        /**
         * 判断obj是否为Number类型
         * @param {*} obj 
         * @return {Boolean}
         */
        isNumber(obj) {
            return typeof obj === 'number' || obj instanceof Number;
        },

        /**
         * 判断obj是否为String类型
         * @param {*} obj 
         * @return {Boolean}
         */
        isString(obj) {
            return typeof obj === 'string' || obj instanceof String;
        },

        /**
         * 从基类中派生出子类
         * @param {Function} child 
         * @param {Function} base 
         * @return {Function}
         */
        extend(child, base) {
            if (!base) {
                rcui.ErrorID(200);
                return;
            }
            if (!child) {
                rcui.ErrorID(201);
                return;
            }
            if (Object.keys(child.prototype).length > 0) {
                rcui.ErrorID(202);
            }
            for (let k in base) {
                if (base.hasOwnProperty(k))
                    child[k] = base[k];
            }
            child.prototype = Object.create(base.prototype);
            return child;
        },

        /**
         * 清楚对象
         * @param {any} obj 
         */
        clear(obj) {
            let keys = Object.keys(obj);
            for (let i = 0; i < keys.length; ++i) {
                delete obj[keys[i]];
            }
        },

        /**
         * 判断对象是否为空
         * @param {any} obj 
         * @return {Blooean}
         */
        isEmptyObject(obj) {
            for (let k in obj) {
                return false;
            }
            return true;
        }
    }
});