import DataTable from "./DataTable";

/**测试存储表格数据的实例表格类 */
export default class TestNpcs extends DataTable {
    public ID: number;
    public Name: string;
    public MapInstanceName: string;
    public MapDependencies: string;
    public TID: string;
    public ExpLevel: number;
    public UnitType: string;
    public UnitCount: number;
    public LevelFile: string;
    public Gold: number;
    public Elixir: string;
    public AlwaysUnlocked: boolean;

    constructor() {
        super();
    }

    init(data: any): void {
        this.ID = data.ID;
        this.Name = data.Name;
        this.MapInstanceName = data.MapInstanceName;
        this.MapDependencies = data.MapDependencies;
        this.TID = data.TID;
        this.ExpLevel = data.ExpLevel;
        this.UnitType = data.UnitType;
        this.UnitCount = data.UnitCount;
        this.LevelFile = data.LevelFile;
        this.Gold = data.Gold;
        this.Elixir = data.Elixir;
        this.AlwaysUnlocked = data.AlwaysUnlocked;
    }
}