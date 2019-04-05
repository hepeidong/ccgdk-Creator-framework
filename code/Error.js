const rcui = require('rcui');

const errorCode = {
    '100': `[加载资源] `,
    '101': '参数错误！参数不能为null！',
    '102': `[参数] 错误 `,

    '200': '基类不能为null',
    '201': '派生类不能为null',
    '202': '在完成继承前，派生类不能用其他属性',

    '1000': '其他错误'
}

rcui.Namespace({
    ErrorID: function(id, msg) {
        if (msg) {
            throw errorCode[id] + `${msg}`;
        }
        throw errorCode[id];
    }
});