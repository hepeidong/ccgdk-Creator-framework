
export class Vector<T>  {
    private _front: number;
    private _rear: number;
    private _max_length: number;
    /** 自动扩容（auto dilatation）*/
    private _auto_dilt: boolean;
    constructor(capacity: number = 50) {
        this._front = 0;
        this._rear = 0;
        this._max_length = capacity;
    }

    public get length(): number {
        return this._rear - this._front;
    }

    /**
     * 队列的容量
     * @param capacity 容量
     * @param autoDilt 是否自动扩容
     * @constructor
     */
    public  reserve(capacity: number, autoDilt: boolean = false): void {
        this._max_length = capacity;
        this._auto_dilt = autoDilt;
    }

    public [Symbol.iterator](): { next: Function } {
        let index: number = 0;
        let that = this;
        return {
            next: function () {
                if (index < that.length) {
                    let value: T = that[index].value;
                    index++;
                    return { value: value, done: false };
                }
                else {
                    return { done: true };
                }
            }
        }
    }

    /**
     * 入队列
     * @param e 入队的元素
     * @returns {boolean}
     * @constructor
     */
    public push(e: T): boolean {
        DEBUG && ASSERT(this.isFull(), 'error:Vector is pull!');
        if (!this.isFull()) {
            this[this._rear] = e;
            this._rear = (this._rear + 1)%this._max_length;
            return true;
        }
        else if (this._auto_dilt) {
            this._max_length = this._max_length*2
            this[this._rear] = e;
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
    public pop(): T {
        DEBUG && ASSERT(this.isEmpty(), 'error:Vector is emty!');
        if (!this.isEmpty()) {
            let e: T = this[this._front];
            this[this._front] = null;
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
    public back(index: number = this._front): T {
        return this[index];
    }

    public isEmpty(): boolean {
        if (this._front == this._rear) {
            return true;
        }
        return false;
    }

    public isFull(): boolean {
        if ((this._rear + 1)%this._max_length == this._front) {
            return true;
        }
        return false;
    }

    public clear(): void {
        this._front = 0;
        this._rear = 0
        this._max_length = 50;
    }

    public contains(e: T): boolean {
        for (let i: number = 0; i < this.length; ++i) {
            if (this[i] === e) {
                return true;
            }
        }
        return false;
    }
}