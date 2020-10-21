export function initDebugInfos(): void {
    if (_DEBUG) {
        let logs = {
            //UILoader
            '100': 'Arguments cannot have a length of 0 in load method!',
            '101': 'The parameter type of the load method is incorrect!',
            '102': 'Error in the first argument!',
            '103': 'Label组件时，url类型错误！',
            '104': 'RichText组件时，url类型错误！',
            '105': 'ParticleSystem组件时，url类型错误！',
            '106': '当前节点没有挂载这个组件！',
            '107': '传入的资源路劲索引url类型错误！',
            '108': '设计内存不足！',
            '109': '必须要传入组件类型！',
            '200': '组件类型错误！',
            '201': 'Call Release of Reference...',
            '202': 'do release ',
            '203': 'Call Retain of Reference...',
            '204': '内存不足，导致无法显示页面，建议扩大项目设计内存，或优化资源。',
            '205': 'Add cache resource error '
        }
        kit._LogInfos = logs;
    }
}