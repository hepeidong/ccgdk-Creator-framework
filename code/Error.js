const rcui = require('rcui');

const errorCode = {
    '100': `[加载资源] `,
    '101': '参数错误！参数不能为null！',
    '102': `[参数] 错误 `,


    '400': '其他错误'
}

rcui.Namespace({
    Error: function(id, msg) {
        if (msg) {
            throw errorCode[id] + `${msg}`;
        }
        throw errorCode[id];
    }
});