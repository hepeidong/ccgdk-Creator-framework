
const ListViewCtrl = cc.Class({
    extends: cc.Component,
    editor: {
        executeInEditMode: false,
        // requireComponent: cc.Sprite,
        menu: '游戏通用组件/UI/ListViewCtrl(滑动视图控制器组件)',
    },
    
    properties: {
        itemTemplate: {
            default: null,
            type: cc.Node,
            tooltip: '项目模板',
            visible: function () {
                return !this.isPrefabTemplate && !this.isPrefabItem;
            },
            serializable: function () {
                return !this.isPrefabTemplate && !this.isPrefabItem;
            }
        },
        scrollView: {
            default: null,
            type: cc.ScrollView,
        },
        isPrefabTemplate: {
            default: false,
            tooltip: '是否為預製體'
        }, //是否為預製體
        itemTemplateUrl: {
            default: 'String',
            tooltip: '預製體路勁',
            visible: function () {
                return this.isPrefabTemplate;
            },
            serializable: function () {
                return this.isPrefabTemplate;
            },
        }, //預製體路勁
        isPrefabItem: {
            default: false
        },
        itemPrefab: {
            default: null,
            type: cc.Prefab,
            visible: function() {
                return this.isPrefabItem;
            }
        },
        component: {
            default: 'String',
            tooltip: '項目組件'
        }, //組件名
        spawnCount: {
            default: 0,
            tooltip: '實際創建的項目數'
        },// how many items we actually spawn 實際創建的item數
        totalCount: {
            default: 0,
            tooltip: '列表能容納的最多項目數'
        },// how many items we need for the whole list 列表能容納最多的item數
        spacing: {
            default: 0,
            tooltip: '項目之間間隔'
        },// space between each item 兩個item之間的間隔
        _bufferZone: 0,// when item is away from _bufferZone, we relocate it 緩衝區大小
        _horizontal: false,
        _vertical: true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (this.scrollView) {
            this.content = this.scrollView.content;
            this._horizontal = this.scrollView.horizontal;
            this._vertical = this.scrollView.vertical;
        }

        this.items = [];
        this.eventHandlers = [];
        // this.initialize();
        this.updateTimer = 0;
        this.updateIntervar = 0.2;
        this.lastContentPos = cc.v2(0, 0); // use this variable to detect if we are scrolling up or down 使用它來判斷是否下滑還是上滑
    },

    start() {
        this._bufferZone = this.scrollView.node.height / 2 + 500;
    },

    hideComponent: function () {
        this.node.active = false;
    },

    initialize: function (itemINFO) {
        // if (!this.isPrefabTemplate) {
        //     this.spawnCount = Math.ceil(this.scrollView.node.height / this.itemTemplate.height);
        // }

        this.info = itemINFO;
        if (this.totalCount < this.spawnCount) {
            this.spawnCount = this.totalCount;
        }
        if (this.isPrefabTemplate) {
            this.initTemplate();
        }
        else if (this.isPrefabItem) {
            this.instantiate(this.itemPrefab);
        }
        else {
            if (this._vertical) {
                this.content.height = this.totalCount * (this.itemTemplate.height + this.spacing) + this.spacing;
            }
            else if (this._horizontal) {
                this.content.width = this.totalCount * (this.itemTemplate.width + this.spacing) + this.spacing;
            }
            this.itemTemplate.name = 'tempItem';
            this.initItemPool(this.itemTemplate);
            this.initItem();
        }
    },

    initItem: function () {
        for (let i = 0; i < this.content.childrenCount; ++i) {
            if (this.content.children[i].name === 'tempItem') {
                this.content.removeChild(this.content.children[i]);
            }
        }
        if (this.items.length > 0)
        {
            for (let i = 0; i < this.items.length; i++)
            {
                this.removeItemInPool(this.items[i].node);
            }
            this.items.splice(0, this.items.length);
        }
        for (let i = 0; i < this.spawnCount; i++)
        {
            this.createItem(this.content, i);
        }
    },

    initTemplate: function () {
        let self = this;
        cc.loader.loadRes(this.itemTemplateUrl, function (err, prefab) {
            if (err) {
                console.error(err);
                return;
            }
            
            self.instantiate(prefab);
        });
    },

    instantiate(prefab) {
        let self = this;
        self.itemTemplate = cc.instantiate(prefab);
        self.itemTemplate.name = 'tempItem';
        if (self._vertical) {
            self.content.height = self.totalCount * (self.itemTemplate.height + self.spacing) + self.spacing;
        }
        else if (self._horizontal) {
            self.content.width = self.totalCount * (self.itemTemplate.width + self.spacing) + self.spacing;
        }
        self.initItemPool(prefab);
        self.initItem();
    },

    //初始化對象池
    initItemPool: function (itemTemplate) {
        this.itemPool = new cc.NodePool();
        for (let i = 0; i < this.spawnCount; i++)
        {
            let item = cc.instantiate(itemTemplate);
            this.itemPool.put(item);
        }
    },

    itemEventHandler: function (item, itemID, handler, customED) {
        if (!this.eventHandlers[itemID]) {
            this.eventHandlers[itemID] = new cc.Component.EventHandler();
        }
        this.eventHandlers[itemID].target = item;
        this.eventHandlers[itemID].component = this.component;
        this.eventHandlers[itemID].customEventData = {itemID: customED, itemINFO: this.info[customED]};
        this.eventHandlers[itemID].handler = handler;
        this.eventHandlers[itemID].emit([handler]);
    },

    itemPosition: function (itemID, item) {
        if (this._horizontal) {
            return cc.v2(-item.width * (0.5 + itemID) - this.spacing * (itemID + 1), 0);
        }
        else if (this._vertical) {
            return cc.v2(0, -item.height * (0.5 + itemID) - this.spacing * (itemID + 1));
        }
    },

    //取出對象池中的對象
    createItem: function (parent, itemID) {
        let item = null;
        if (this.itemPool.size() > 0) {
            item = this.itemPool.get();
        }
        else {
            item = cc.instantiate(this.itemTemplate);
            this.itemPool.put(item);
        }
        item.parent = parent;
        item.setPosition(this.itemPosition(itemID, item));
        item.name += '_' + itemID;
        // item.itemID = itemID;
        this.items.push({id: itemID, node: item});
        //回调函数初始化item
        this.itemEventHandler(item, itemID, 'onInitItem', itemID);
    },

    //把對象重新放入對象池
    removeItemInPool: function (item) {
        this.itemPool.put(item);
    },

    getPositionInView: function (item) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    update (dt) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateIntervar) return; //每兩幀執行一次
        if (this.itemTemplate == null) return;
        this.updateTimer = 0;
        let items = this.items;
        let buffer = this._bufferZone;
        let offset = 0;
        if (this._vertical) {
            offset = (this.itemTemplate.height + this.spacing) * items.length; //所有item加起來的總高度
        }
        else if (this._horizontal) {
            offset = (this.itemTemplate.width + this.spacing) * items.length; //所有item加起來的總宽度
        }
        (this.lastContentPos.y);
        (this.scrollView.content.y);

        let isDown = this.scrollView.content.y < this.lastContentPos.y; //是否下滑
        let isLeft = this.scrollView.content.x < this.lastContentPos.x; //是否右滑
        for (let i = 0; i < items.length; i++)
        {
            let viewPos = this.getPositionInView(items[i].node);
            if (this._vertical) {
                if (isDown)
                {
                    //當前為下滑
                    if (viewPos.y < -buffer && items[i].node.y + offset < 0)
                    {
                        items[i].node.y = items[i].node.y + offset;  
                        this.updateItem(i, isDown);
                    }
                }
                else
                {
                    //當前為上滑
                    if (viewPos.y > buffer && items[i].node.y - offset > -this.content.height)
                    {
                        items[i].node.y = items[i].node.y - offset;
                        this.updateItem(i, isDown);
                    }
                }
            }
            else if (this._horizontal) {

                if (isLeft)
                {
                    //當前為右滑
                    if (viewPos.x < -buffer && items[i].node.x + offset < 0)
                    {
                        items[i].node.y = items[i].node.x + offset;
                        this.updateItem(i, isLeft);
                    }
                }
                else
                {
                    //當前為左滑
                    if (viewPos.x > buffer && items[i].node.x - offset > -this.content.height)
                    {
                        items[i].node.y = items[i].node.x - offset;
                        this.updateItem(i, isLeft);
                    }
                }
            }
        }
        this.lastContentPos = this.scrollView.content.getPosition();
    },

    //更新视图列表中每个项目的内容
    updateItem: function (index, flag) {
        let item = this.items[index];
        if (!flag) {
            item.id = item.id + this.items.length;
        }
        else {
            item.id = item.id - this.items.length;
        }
        this.itemEventHandler(this.items[index].node, index, 'onUpdateItem', item.id);
    },

    //更新视图列表的内容
    updateListView: function (info) {
        this.itemPool = null;
        this.initialize(info);
    },

    addItem: function() {
        if (this._vertical) {
            this.content.height = (this.totalCount + 1) * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        }
        else if (this._horizontal) {
            this.content.width = (this.totalCount + 1) * (this.itemTemplate.width + this.spacing) + this.spacing; // get total content height
        }
        this.totalCount = this.totalCount + 1;
    },

    removeItem: function() {
        if (this.totalCount - 1 < this.spawnCount) {
            cc.error("can't remove item less than " + this.spawnCount + '!');
            return;
        }

        if (this._vertical) {
            this.content.height = (this.totalCount - 1) * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        }
        else if (this._horizontal) {
            this.content.width = (this.totalCount - 1) * (this.itemTemplate.width + this.spacing) + this.spacing; // get total content height
        }
        this.totalCount = this.totalCount - 1;
    },

     //新增: 查看明细先关
     setSpawnCount: function (num) {
        if (num < 6) {
            this.spawnCount = this.totalCount = num;
        } else {
            this.spawnCount = num - 3;
            this.totalCount = num;
        }
    },

});
