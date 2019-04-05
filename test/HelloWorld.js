const rcui = require('rcui');

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        // rcui.getClass('loader');
        // console.log(rcui.loader.addNode);
        rcui.loader.loadResDir('Res', function(){}, rcui.loader.Tag.SINGLE_USE);
        // console.log(cc.loader._cache);
        // console.log(rcui);
        // console.log(rcui.Error);
        var button = this.node.getChildByName('button');
        rcui.loader.addNode(button);
    },

    onClick: function () {
        // console.log('onClick');
        cc.director.loadScene('test');
    },

    // called every frame
    update: function (dt) {

    },
});
