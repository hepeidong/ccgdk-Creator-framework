
export default class NumberUtil {
    private static _unitsList: Array<{units: string, ratio: number}> = [
        {units: '百', ratio: 100},
        {units: '千', ratio: 1000},
        {units: '万', ratio: 10000},
        {units: '亿', ratio: 100000000},
        {units: '兆', ratio: 1000000000000}
    ];
    constructor() {
        
    }

    public static round(num: number, keep: number = 0): number {
        let multiple: number = 1;
        while (keep-- > 0) multiple = multiple * 10;
        num = num * multiple;
        return Math.round(num) / multiple;
    }

    public static random(min: number, max: number): number {
        var delta = max - min;
        var rand = Math.random();
        return (min + rand * delta);
    }

    public static randomInt(min: number, max: number): number {
        return Math.round(this.random(min, max));
    }

    /**
     * 数字取整，整千，整万这类
     * @param num 数字
     * @param units 单位，从百单位开始，0：百，1：千，2：万，3：十万，以此类推
     */
    public static roundNumber(num: number, units: number = 0): number {
        let ret: number = Math.floor(num / this._unitsList[units].ratio);
        return ret;
    }

    /**
     * 取整后的数字格式，形式为 5十万这类
     * @param num 数字
     * @param units 单位，从百单位开始，0：百，1：千，2：万，3：亿， 4：兆
     */
    public static numberFormat(num: number, units: number = 0): string {
        let ret: string = '';
        if (num < this._unitsList[units].ratio) {
            ret = num.toString();
        }
        else {
            let currRatio: number = this._unitsList[units].ratio;
            let currUnits: number = units;
            let lastUnits: number = units + 1 >= this._unitsList.length ? -1 : (units + 1);
            let lastRatio: number = lastUnits === -1 ? 0 : this._unitsList[lastUnits].ratio;
            let p: number = num / currRatio;//数值除以单位的倍数，得到取整前的基础数值
            while (1) {
                //判断当前数字值是否达到了下一个单位的大小，比如选定从亿开始，如果数字值大于一兆，说明是使用下一个单位，
                if (lastUnits > -1 && lastRatio > 0 && p >= lastRatio / currRatio) {
                    currUnits = lastUnits;
                    lastUnits = currUnits + 1 >= this._unitsList.length ? -1 : (currUnits + 1);
                    currRatio = this._unitsList[currUnits].ratio;
                    lastRatio = lastUnits === -1 ? 0 : this._unitsList[lastUnits].ratio;
                    p = num / currRatio;
                }

                else if (p < 1) {
                    --currUnits;
                    lastUnits = lastUnits !== -1 ? --lastUnits : (this._unitsList.length - 1);
                    currRatio = this._unitsList[currUnits].ratio;
                    lastRatio = lastUnits === -1 ? 0 : this._unitsList[lastUnits].ratio;
                    p = num / currRatio;
                }
                else {
                    break;
                }
            }
            if (p >= 10) {
                ret = Math.floor(p) + this._unitsList[currUnits].units;
            }
            else {
                ret = p + this._unitsList[currUnits].units;
            }
        }
        return ret;
    }

    public static decimalFormat(num: number): string {
        let temp: number = Math.round(num);
        let ret: string = '';
        let div: number = 1000;
        while (temp >= 1) {
            let remainder: number = temp % div;
            ret = remainder.toString() + (ret === '' ? ret : ',' + ret);
            temp = (temp - remainder) / div;
        }
        return ret;
    }

    public static isPrime(num: number): boolean {
        for (let i: number = 2; (i * i) <= num; ++i) {
            if (!(num % i)) return false;
        }
        return true;
    }

    public static findPrime(num: number): number[] {
        let flag: number[] = [];
        let primeCount = 0;
        let primes: number[] = [];
        for (let i: number = 2; i <= num; ++i) {
            if (!flag[i]) {
                primeCount++;
                primes[primeCount] = i;
                for (let j: number = 2 * i; j <= num; j += i) {
                    flag[j] = 1;
                }
            }
        }
        return primes;
    }
}
