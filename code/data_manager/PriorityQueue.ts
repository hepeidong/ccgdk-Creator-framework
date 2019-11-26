/**优先队列结点数据结构 */
class HeapNode<T> {
    private _value: T;
    constructor(val: T){
        this._value = val;
    }
    
    public set value(val: T) { this._value = val; }
    public get value(): T { return this._value; }
    public static ParentIndex(index: number): number { return  Math.floor((index - 1) / 2); }
    public static LeftIndex(index: number): number { return index * 2 + 1; }
    public static RightIndex(index: number): number { return index * 2 + 2; }
}

/**优先队列
 * 优先队列采用二叉堆存储结构（数组存储结构的二叉树），优先从左节点存储数据，第一个根节点默认也存储数据（这个可以改成第一个结点不存储数据的没问题）
 * 优先级规则可以自由的设定，通过new PriorityQueue<T>((a, b) => { return a > b; })这种模式，传入优先级规则
 * 若传入的规则中a > b，则是从大到小排列，反之，从小到大排列
 */
export class PriorityQueue<T> {
    private _nodes: Array<HeapNode<T>>;
    private _compareFn: (a: T, b: T) => boolean;

    constructor(compareFn: (a: T, b: T) => boolean) {
        this._nodes = [];
        this._compareFn = compareFn;
    }

    public get Front(): T { return this._nodes[0].value; }

    public get Length(): number { return this._nodes.length; }

    /**
     * 压入元素，从左子树开始，左子树在数组中的下标为2*i+1，因此相应的父节点下标为(i-1)/2，右子树的下标为2*i+2，相应的父节点下标为(i-2)/2
     * @param e 压入的元素
     */
    public Push(e: T) {
        let node: HeapNode<T> = new HeapNode<T>(e);
        if (!node) {
            throw new Error('堆结点实例化失败！');
        }
        this._nodes.push(node);
        this.BuildMaxHeap();
    }

    /**
     * 出队列，把队列的根节点删除，并返回删除的元素，删除的过程是把根节点不断的下沉到最后的位置，然后删除最后一个元素
     */
    public Pop(): T {
        this.SearchMaxHeap();
        return this._nodes.pop().value;
    }

    /**互换结点 */
    private Swap(a: number, b: number): void {
        let temp:HeapNode<T> = this._nodes[a];
        this._nodes[a] = this._nodes[b];
        this._nodes[b] = temp;
    }

    /**构建最大堆结点，把最大堆结点上浮到队头 */
    private BuildMaxHeap(): void {
        let index: number = this._nodes.length - 1;
        if (index <= 0) return;
        let parentIndex: number = HeapNode.ParentIndex(index);
        while (this._compareFn && this._compareFn(this._nodes[index].value, this._nodes[parentIndex].value)) {
            this.Swap(index, parentIndex);
            index = parentIndex;
            parentIndex = HeapNode.ParentIndex(index);
        }
    }

    /**搜寻和维护最大堆结点，把最大堆结点下沉到最后的叶节点 */
    private SearchMaxHeap(): void {
        let index: number = 0;
        let lIndex: number = HeapNode.LeftIndex(index);
        let rIndex: number = HeapNode.RightIndex(index);
        let endIndex: number = this._nodes.length - 1;
        while (1) {
            if (rIndex <= endIndex) {
                if (this._compareFn && this._compareFn(this._nodes[lIndex].value, this._nodes[rIndex].value)) {
                    this.Swap(index, lIndex);
                    index = lIndex;
                }else {
                    this.Swap(index, rIndex);
                    index = rIndex;
                }
            }else if (lIndex <= endIndex) {
                this.Swap(index, rIndex);
                index = rIndex;
            }else {
                break;
            }

            lIndex = HeapNode.LeftIndex(index);
            rIndex = HeapNode.RightIndex(index);
        }
        if (index != endIndex) {
            this.Swap(index, endIndex);
        }
    }
}