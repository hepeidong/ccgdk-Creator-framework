

declare namespace config {
	export class Temp{
		/**id */
		public readonly id: number;
		/**姓名 */
		public readonly name: string;
		/**年龄 */
		public readonly age: number;
		/**成绩 */
		public readonly achievement: number[];
		/**是否毕业 */
		public readonly graduate: boolean;
		/**这是一个二维数组 */
		public readonly test1: number[][];
		/**布尔值数组 */
		public readonly test2: boolean[];
	}

	export class Skill{
		/**id */
		public readonly id: number;
		/**技能1 */
		public readonly skill1: number;
		/**技能2 */
		public readonly skill2: number;
		/**技能3 */
		public readonly skill3: number;
		/**技能4 */
		public readonly skill4: number;
		/**技能5 */
		public readonly skill5: number;
	}

}

interface IFileData {
	Temp?: IContainer<config.Temp>;
	Skill?: IContainer<config.Skill>;
}

type cck_file_data = {
	[K in keyof IFileData]: Readonly<IFileData[K]>;
}

/**配置表文件容器类型 */
interface IContainer<T> {
    readonly keys: number[]|string[];
    readonly length: number;
    readonly fields: cck_file_field_type<T>;
    /**
     * 根据id获取配置表的数据
     * @param id 
     * @returns 返回对应的id的配置表对象
     */
    get(id: number|string): T;
    /**
     * 获取当前表中的这个字段的值的累加，只有这个字段数据类型为number时才有用
     * @param field 当前配置表字段名
     * @returns 返回这个字段在当前配置表中的值的累加，如果数据类型不是number，则返回null
     */
    getSumOf(field: string): number|null;
    /**
     * 遍历当前配置表
     * @param callback 
     */
    forEach(callback: (value: T, index: number) => void): void;
    /**
     * 是否存在这个id的数据
     * @param id 
     */
    contains(id: number|string): boolean;
}

type cck_file_field<T> = { [K in keyof T]: K; }
type cck_file_field_type<T> =  Readonly<cck_file_field<T>>;