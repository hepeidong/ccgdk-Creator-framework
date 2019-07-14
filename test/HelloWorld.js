const R = require('R');

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
        // R.getClass('loader');
        // console.log(R.loader.addNode);
        R.loader.loadResDir('Res', function(){}, R.loader.Tag.SINGLE_USE);
        // console.log(cc.loader._cache);
        // console.log(R);
        // console.log(R.ErrorID);
        var button = this.node.getChildByName('button');
        R.loader.addNode(button);
    },

    onClick: function () {
        // console.log('onClick');
        cc.director.loadScene('test');
    },

    // called every frame
    update: function (dt) {

    },
});
