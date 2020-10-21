
interface DateFormatArgs {
    date: string;   //时间字符，格式为xxxx-xx-xxTxx:xx:xx
    tm: number;     //时间戳
    format: string; //时间日期表达格式
}

export default class DateUtil {
    public static readonly ONE_MINUTE: number = 60;
    public static readonly ONE_HOUR: number = 3600;
    public static readonly ONE_DAY: number = 86400;
    public static readonly ONE_MONTH: number = 2592000;
    public static readonly ONE_YEAR: number = 31102000;

    public static _cdLastMap: Map<string, number> = new Map();
    constructor() {
        
    }

    public static inCD(internal: number, id: any = 0): boolean {
        let key: string = '$' + id.toString();
        let cdLastTime: number = this._cdLastMap.get(key);
        if (!cdLastTime) {
            this._cdLastMap.set(key, 0);
            return false;
        }
        if (new Date().getTime() - cdLastTime > internal) {
            this._cdLastMap.set(key, new Date().getTime());
            return false;
        }
        return true;
    }

    /**
     * 比较两个日期
     * @param date1 
     * @param date2 
     */
    public static comparingDate(date1: Date, date2: Date): boolean {
        var Date1: Date = new Date(date1);
        var Date2: Date = new Date(date2);

        var diff: number = Date1.getTime() - Date2.getTime();
        if (diff < 0) {
            //时间1 小于时间2
            return false;
        } else if (diff > 0) {
            //时间1 大于时间2
            return true;
        } else {
            //两个时间相等，返回false
            return false;
        }
    }

    /**
     * 时间格式
     * @param tm 时间戳
     */
    public static dateFormat(tm: number, format: string): string;
    public static dateFormat(tm: number): string;
    public static dateFormat(format: string): string;
    public static dateFormat(): string {
        let args: DateFormatArgs = this.makeArgs.apply(null, arguments);
        let now: Date;
        if (args === null || (args.tm === null && args.date === null)) {
            now = new Date();
        }
        else if (args.date) {
            now = new Date(args.date);
        }
        else if (args.tm) {
            now = new Date(args.tm);
        }

        const year: string = now.getFullYear().toString();
        const month: string = (now.getMonth() + 1).toString();
        const day: string = now.getDate().toString();
        const hours: string = this.timeStr(now.getHours(), 2);
        const minutes: string = this.timeStr(now.getMinutes(), 2);
        const seconds: string = this.timeStr(now.getSeconds(), 2);
        const milliseconds: string = this.timeStr(now.getMilliseconds(), 3);
        if (args === null || args.format === null || args.format === '') {
            if (args && args.date) {
                return this.normalFormat(year, month, day, null, null, null, null);
            }
            else {
                return this.normalFormat(year, month, day, hours, minutes, seconds, milliseconds);
            }
        }
        else {
            return utils.StringUtil.format(args.format, year, month, day, hours, minutes, seconds, milliseconds);
        }
    }

    /**
    * 判断是否在某个时间内
    * @param  now 
    * @param  start
    * @param  end 
    */
    public static atThisTime(now: Date, start: string, end: string): boolean {
        if (this.atStartTimeFrame(now, start)) {
            return this.outOfTime(now, end);
        }
        else {
            //还没到开始时间
            return false;
        }
    }

    private static timeStr(timeNum: number, len: number): string {
        const str: string = String(timeNum);
        const strLen: number = len - str.length;
        if (strLen < 0) {
            return str;
        }
        else {
            let tempStr: string = '';
            for (let i: number = 0; i < strLen; ++i) {
                tempStr += '0';
            }
            return `${tempStr}${str}`;
        }
    }

    private static makeArgs(): DateFormatArgs {
        if (arguments.length === 0) {
            return null;
        }
        let args: DateFormatArgs = { date: null, tm: null, format: null };
        for (let i: number = 0; i < arguments.length; ++i) {
            if (typeof arguments[i] === 'number') {
                args.tm = arguments[i];
            }
            else if (typeof arguments[i] === 'string') {
                let strArr: string[] = arguments[i].split('T');
                if (strArr.length === 2 && strArr[0].split('-').length === 3 && strArr[1].split(':').length === 3) {
                    args.date = arguments[i];
                }
                else {
                    args.format = arguments[i];
                }
            }
        }
        return args;
    }

    private static normalFormat(
        year: string,
        month: string,
        day: string,
        hours: string,
        minutes: string,
        seconds: string,
        milliseconds: string
    ): string {
        let dateList: string[] = [];
        if (year) dateList.push(year);
        if (month) dateList.push(month);
        if (day) dateList.push(day);
        let timeList: string[] = [];
        if (hours) timeList.push(hours);
        if (minutes) timeList.push(minutes);
        if (seconds) timeList.push(seconds);
        if (milliseconds) timeList.push(milliseconds);
        const date: string = dateList.join('-');
        const times: string = timeList.join(':');
        return `${date} ${times}`;
    }

    private static atStartTimeFrame(now: Date, start: string): boolean {
        if (!start) return;
        let startDateStrArr = start.split(' ');
        let startDate = startDateStrArr[0].split('-');
        let startYear = parseInt(startDate[0]);
        let startMonth = parseInt(startDate[1]);
        let startDay = parseInt(startDate[2]);
        let startTime = startDateStrArr[1].split(':');
        let startHours = parseInt(startTime[0]);
        let startMinutes = parseInt(startTime[1]);
        let startSeconds = parseInt(startTime[2]);

        if (now.getFullYear() >= startYear) {
            if ((now.getMonth() + 1) > startMonth) return true;
            else if ((now.getMonth() + 1) == startMonth && (now.getDate()) > startDay) return true;
            else if ((now.getDate()) == startDay && now.getHours() > startHours) {
                return true;
            }
            else if (now.getHours() == startHours && now.getMinutes() > startMinutes) {
                return true;
            }
            else if (now.getHours() == startHours && now.getMinutes() == startMinutes && now.getSeconds() >= startSeconds) {
                return true;
            }
            else {
                //还没到开始时间
                return false;
            }
        }
        else {
            //还没到开始时间
            return false;
        }
    }

    private static outOfTime(now: Date, end: string): boolean {
        let endDateStrArr = end.split(' ');
        let endDate = endDateStrArr[0].split('-');
        let endYear = parseInt(endDate[0]);
        let endMonth = parseInt(endDate[1]);
        let endDay = parseInt(endDate[2]);
        let endTime = endDateStrArr[1].split(':');
        let endHours = parseInt(endTime[0]);
        let endMinutes = parseInt(endTime[1]);
        let endSeconds = parseInt(endTime[2]);

        if (now.getFullYear() <= endYear) {
            if ((now.getMonth() + 1) < endMonth) return true;
            else if ((now.getMonth() + 1) == endMonth && (now.getDate()) < endDay) return true;
            else if ((now.getDate()) == endDay && now.getHours() < endHours) {
                return true;
            }
            else if (now.getHours() == endHours && now.getMinutes() < endMinutes) {
                return true;
            }
            else if (now.getHours() == endHours && now.getMinutes() == endMinutes && now.getSeconds() < endSeconds) {
                return true;
            }
            else {
                //超过了结束时间
                return false;
            }
        }
        else {
            //超过了结束时间
            return false;
        }
    }
}
