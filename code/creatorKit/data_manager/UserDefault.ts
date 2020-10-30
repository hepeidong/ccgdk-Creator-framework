
type ValueT = number|string|object|boolean|null|undefined|Function;
type DataT = {value:ValueT};

export class UserDefault {

    constructor() {
        
    }

    public static set(key: string, value: any): void {
        let data: DataT = {value: value};
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    public static get(key: string): ValueT {
        let data: string = cc.sys.localStorage.getItem(key);
        if (data) {
            let map: DataT = JSON.parse(data);
            return map.value;
        }
        return null;
    }

    public static getPriorityQueue<T extends kit.PriorityQueue<T>>(comparefn: (a: T, b: T) => boolean): kit.PriorityQueue<T> {
        let pq: kit.PriorityQueue<T> = new kit.PriorityQueue(comparefn);
        if (!pq) {
            throw new Error('无法实例化优先队列');
        }
        return pq;
    }

    public static getVector<T extends kit.Vector<T>>(len: number = 50): kit.Vector<T> {
        let vtr: kit.Vector<T> = new kit.Vector(len);
        if (!vtr) {
            throw new Error('无法实例化队列');
        }
        return vtr;
    }
}