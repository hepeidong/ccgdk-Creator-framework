//聊天區域排佈的風格
var styleEnum = cc.Enum({
    TOP_TO_BOTTOM: 0,
    BOTTOM_TO_TOP: 1,
});
var GB2312UnicodeConverter = {
    ToUnicode:function(str){
        return escape(str).toLocaleLowerCase().replace(/%u/gi,'\\u');
    },
    ToGB2312:function(str){
        return unescape(str.replace(/\\u/gi,'%u'));
    }
};
cc.Class({
    extends: cc.Component,
    editor: {
        executeInEditMode: false,
        menu: '游戏通用组件/UI/Chat(聊天组件)'
    },
    properties: {
        chatItem: {
            type: cc.Prefab,
            default: null
        },

        spawnCount: {
            default: 0,
            tooltip: '实际创建的项目数',
        },

        showCount: {
            default: 0,
            tooltip: '实际显示的项目数'
        },

        spacing: {
            default: 10,
            tooltip: '两个项目之间的间隙'
        },

        //item layout style
        layoutStyle: {
            default: styleEnum.BOTTOM_TO_TOP,
            type: styleEnum,
            tooltip: '聊天消息排佈的風格：BOTTOM_TO_TOP 為從上到下排佈；TOP_TO_BOTTOM 為從下到上排佈'
        },

        nicknameLen: {
            default: 4,
            tooltip: '昵称长度'
        },

        component: {
            default: ''
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.eventHandlers = [];
        this.itemAll = [];
        this.itemsIndex = 0;
        this.isFullItems = false;
        this.initialize();
    },

    start() {
        
    },

    onDestroy: function () {
    },

    initialize: function () {
        let item = cc.instantiate(this.chatItem);
        this.showCount = Math.ceil(this.node.height / item.height);
        this.spawnCount = this.showCount + 2;
        //初始化view
        let view = new cc.Node();
        view.name = 'view';
        view.parent = this.node;
        view.anchorY = 0;
        view.y = -this.node.height / 2;
        view.width = this.node.width;
        view.addComponent(cc.Mask);
        // view.height = this.showCount * this.leftItem.height + this.spacing * this.showCount + this.spacing;
        view.height = this.node.height;

        //初始化content
        this.content = new cc.Node();
        this.content.name = 'content';
        this.content.parent = view;
        this.content.anchorY = 0;
        this.content.y = 0;
        this.content.width = this.node.width;
        // this.content.height = this.showCount * this.leftItem.height + this.spacing * this.showCount + this.spacing;
        this.content.height = this.node.height;
    },

    start () {},

    //取出對象池中的對象
    createItem: function (parent, itemTemp) {
        let item = cc.instantiate(itemTemp);
        item.anchorY = 0;
        item.parent = parent;
        this.itemAll.push(item);
    },

    //把對象重新放入對象池
    removeItem: function () {
        this.content.removeAllChildren();
        this.itemsIndex = 0;
        this.isFullItems = false;
        this.itemAll.splice(0, this.itemAll.length);
        this.eventHandlers.splice(0, this.eventHandlers.length);
    },

    addChat(chatData) {
        if (this.itemAll.length < this.spawnCount) {
            this.createItem(this.content, this.chatItem);
        }

        this.updateItem(this.itemAll[this.itemsIndex], chatData);
        this.showChatItem();
    },

    showChatItem: function () {
        if (this.itemAll.length > this.showCount) {
            this.moveChatItemY();
        }
        else {
            this.chatItemPositionYInPart(this.itemAll[this.itemsIndex], this.itemsIndex);
        }
        //在这里重置itemsIndex
        this.itemsIndex++;
        if (this.itemsIndex == this.spawnCount) this.itemsIndex = 0;

        if (this.itemAll.length == this.spawnCount) {
            this.isFullItems = true;
        }
    },

    //移動item的y坐標
    moveChatItemY: function () {
        let itemsIndex = this.itemAll.length - 1;
        let vacantPosIndex = this.itemsIndex;//空缺位置索引
        for (let i = 0; i < this.itemAll.length; i++)
        {
            if (this.isFullItems)
            {
                if (i > this.itemsIndex)
                {
                    this.chatItemPositionYInFull(this.itemAll[i], itemsIndex);
                    itemsIndex--;
                }
            }
            else
            {
                this.chatItemPositionYInFull(this.itemAll[i], itemsIndex);
                itemsIndex--;
            }
        }
    
        if (this.isFullItems) {
            for (let i = 0; i <= this.itemsIndex; i++)
            {
                this.chatItemPositionYInFull(this.itemAll[i], vacantPosIndex);
                vacantPosIndex--;
            }   
        }
        
    },

    //儅聊天區域佈滿消息時調用
    chatItemPositionYInFull: function (item, index) {
        if (this.layoutStyle == styleEnum.BOTTOM_TO_TOP) {
            item.y = this.content.height - item.height * (0.5 + index) - this.spacing * (index + 1);
        }
        else if (this.layoutStyle == styleEnum.TOP_TO_BOTTOM) {
            item.y = item.height * (0.5 + index) + this.spacing * (index + 1);
        }
    },

    //儅聊天區域沒有佈滿消息時調用
    chatItemPositionYInPart: function (item, index) {
        if (this.layoutStyle == styleEnum.BOTTOM_TO_TOP) {
            item.y = item.height * (0.5 + index) + this.spacing * (index + 1);
        }
        else if (this.layoutStyle == styleEnum.TOP_TO_BOTTOM) {
            item.y = this.content.height - item.height * (0.5 + index) - this.spacing * (index + 1);
        }
    },

    itemEventHandler: function (item, itemID, handler, customED) {
        if (!this.eventHandlers[itemID]) {
            this.eventHandlers[itemID] = new cc.Component.EventHandler();
        }
        this.eventHandlers[itemID].target = item;
        this.eventHandlers[itemID].component = this.component;
        this.eventHandlers[itemID].customEventData = customED;
        this.eventHandlers[itemID].handler = handler;
        this.eventHandlers[itemID].emit([handler]);
    },

    // update (dt) {},

    updateItem: function (item, chatData) {
        this.itemEventHandler(item, this.itemsIndex, 'updateChat', chatData);
    },

    updateLeftItem() {

    },

    updateRightItem() {

    }
});
