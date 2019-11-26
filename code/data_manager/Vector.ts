
export class Vector<T>  {
    private _data: Array<T>;
    private _front: number;
    private _rear: number;
    private _max_length: number;
    /** 自动扩容（auto dilatation）*/
    private _auto_dilt: boolean;
    constructor(len: number = 50){
        this._data = new Array<T>();
        this._front = 0;
        this._rear = 0;
        this._max_length = len;
    }

    /**
     * 队列的长度
     * @param len 长度
     * @param autoDilt 是否自动扩容
     * @constructor
     */
    public  Reserve(len: number, autoDilt: boolean = false): void {
        this._max_length = len;
        this._auto_dilt = autoDilt;
    }

    /**
     * 入队列
     * @param e 入队的元素
     * @returns {boolean}
     * @constructor
     */
    public Push(e: T): boolean {
        _DEBUG && ASSERT(this.IsFull(), 'Error:Vector is pull!');
        if (!this.IsFull()) {
            this._data[this._rear] = e;
            this._rear = (this._rear + 1)%this._max_length;
            return true;
        }
        else if (this._auto_dilt) {
            this._max_length = this._max_length*2
            this._data[this._rear] = e;
            this._rear = (this._rear + 1)%this._max_length;
            return true;
        }
        return false;
    }

    /**
     * 出列，然后删除对顶元素
     * @returns {any}
     * @constructor
     */
    public Pop(): T {
        _DEBUG && ASSERT(this.IsEmpty(), 'Error:Vector is emty!');
        if (!this.IsEmpty()) {
            let e: T = this._data[this._front];
            this._data[this._front] = null;
            this._front = (this._front + 1)%this._max_length;
            return e;
        }
        return null;
    }

    /**
     * 出列，不删除对顶元素
     * @param index
     * @returns {T}
     * @constructor
     */
    public Back(index: number = this._front): T {
        return this._data[index];
    }

    public IsEmpty(): boolean {
        if (this._front == this._rear) {
            return true;
        }
        return false;
    }

    public IsFull(): boolean {
        if ((this._rear + 1)%this._max_length == this._front) {
            return true;
        }
        return false;
    }

    public Clear(): void {
        this._front = 0;
        this._rear = 0
        this._max_length = 50;
        this._data = null
    }

    public Contains(e: T): boolean {
        return this._data.indexOf(e) > -1 ?  true : false;
    }

    public Length(): number {
        return this._rear - this._front;
    }
}