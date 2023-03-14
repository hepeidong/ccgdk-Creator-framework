import { Vec3 } from "cc";

export  class MathUtil {

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

    public static randomNonRepeat(min: number, max: number, numberCount?: number): number[] {
        return this.getRandomNonRepeat(min, max, numberCount, false);
    }

    public static randomIntNonRepeat(min: number, max: number, numberCount?: number): number[] {
        return this.getRandomNonRepeat(min, max, numberCount, true);
    }

    public static percent(origin: number, ratio: number): number {
        return origin * (1 + ratio / 100);
    }

    /**
     * 是否为素数
     * @param num 
     */
    public static isPrime(num: number): boolean {
        for (let i: number = 2; (i * i) <= num; ++i) {
            if (!(num % i)) return false;
        }
        return true;
    }

    /**
     * 返回某个数以内的所有素数
     * @param num 
     */
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

    /**
     * 把弧度计算成具体的角度，可以传入两个向量，计算两个向量的角度，也可以传入弧度计算角度
     * @param a 传入的弧度或者向量
     * @param b 传入的向量
     * @returns number
     */
     public static angle(a: number|Vec3, b?: Vec3): number {
        if (typeof a === "number") {
            return a as number * 180 / Math.PI;
        }
        else {
            return Vec3.angle(a as Vec3, b) * 180 / Math.PI;
        }
    }

    /**
     * 把角度计算成具体的弧度，可以传入具体的角度，计算成弧度，也可以传入两个向量，计算向量夹角的弧度
     * @param a 传入的角度或者向量
     * @param b 传入的向量
     * @returns 
     */
    public static radian(a: number|Vec3, b?: Vec3): number {
        if (typeof a === 'number') {
            return a * Math.PI / 180;
        }
        else {
            return Vec3.angle(a, b);
        }
    }

    /**
     * 计算两点距离
     * @param v1 
     * @param v2 
     */
     public static distance(v1: Vec3, v2: Vec3): number {
        let X: number = (v1.x - v2.x) * (v1.x - v2.x);
        let Y: number = (v1.y - v2.y) * (v1.y - v2.y);
        let Z: number = (v1.z - v2.z) * (v1.z - v2.z);
        return Math.sqrt(X + Y + Z);
    }

    /**返回不重复随机数 */
    private static getRandomNonRepeat(min: number, max: number, numberCount?: number, int: boolean = true): number[] {
        if (!numberCount) {
            numberCount = max - min + 1;
        }
        if (numberCount === max - min + 1) {
            return this.nonRepeat2(min, max, int);
        }
        else if (int && numberCount < max - min + 1) {
            return this.nonRepeat1(min, max, numberCount, int);
        }
        else if (!int) {
            return this.nonRepeat1(min, max, numberCount, int);
        }
        return [];
    }

    /**获取不重复随机数的个数时,个数不等于最大值max时使用 */
    private static nonRepeat1(min: number, max: number, numberCount: number, int: boolean): number[] {
        let result: number[] = [];
        for (let i: number = 0; i < numberCount; ++i) {
            let repeat: boolean = false;
            let temp: number = int ? this.randomInt(min, max) : this.random(min, max);
            for (let k: number = 0; k < i; ++k) {
                if (temp === result[k]) {
                    repeat = true;
                    break;
                }
            }
            if (!repeat) {
                result.push(temp);
            }
            else {
                i--;
            }
        }

        return result;
    }
    /**获取随机数的个数时,个数等于最大值max时使用 */
    private static nonRepeat2(min: number, max: number, int: boolean): number[] {
        let result: number[] = [];
        for (let i: number = min; i <= max; ++i) {
            result.push(i);
        }
        for (let k: number = max - min; k >= 0; --k) {
            let index: number = int ? this.randomInt(0, max - min) : this.random(min, max);
            //交换两个元素的位置
            if (index !== k) {
                result[index] = result[index] + result[k];
                result[k] = result[index] - result[k];
                result[index] = result[index] - result[k];
            }
        }
        return result;
    }
}
