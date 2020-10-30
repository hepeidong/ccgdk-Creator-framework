import FileContainer from "./FileContainer";
import DataTable from "./DataTable";

/**
 * 配置表管理父类，自定义的管理类必须继承它
 */
export class GameFileManager {
    private _csvTables: {name: string, type: typeof DataTable}[] = [];
    private _fileMap: Map<any, FileContainer<any>>;
    constructor() {
       this._fileMap = new Map();
    }

    public addGameTable(fileName: string, tableType: typeof DataTable): void {
        let tableInfo = {name: fileName, type: tableType};
        this._csvTables.push(tableInfo);
    }

    private Init(tableMap: Map<string, string[]>) {
        for (let ele of this._csvTables) {
            this.SetGameTable(ele.name, ele.type, tableMap);
        }
    }

    public get<T extends DataTable>(type: {prototype: T}): FileContainer<T> {
        return this._fileMap.get(type);
    }

    public getById<T extends DataTable>(type: {prototype: T}, id: number): FileContainer<T> {
        return this._fileMap.get(type).get(id);
    }

    public loadCSVTable(url: string, progressfn?: (completedCount: number, totalCount: number) => void, completefn?: (error: Error) => void) {
        cc.loader.loadResDir(url, (completedCount: number, totalCount: number, _item: any) => {
            progressfn && progressfn(completedCount, totalCount);
        }, (error: Error, resource: any[], urls: string[]) => {
            if (error) {
                completefn && completefn(error);
                return;
            }
            let tableMap: Map<string, string[]> = new Map();
            for (let i: number = 0; i < urls.length; ++i) {
                const urlSplit: string[] = urls[i].split('/');
                tableMap.set(urlSplit[urlSplit.length - 1], resource[i].text.split('\n'));
            }
            this.Init(tableMap);
        });
    }

    private SetGameTable(fileName: string, TableType: typeof DataTable, tableMap: Map<string, string[]>) {
        this.ParserData(tableMap.get(fileName), TableType, fileName);
    }

    private ParserData(data: any[], TableType: typeof DataTable, fileName: string) {
        const keys: string[] = data[0].split(',');
        const types: string[] = data[1].split(',');
        const result: any[] = [];
        let dataIndex: number = 0;
        let fileContainer = new FileContainer();
        for (let i: number = 2; i < data.length; ++i) {
            const values: any[] = data[i].split(',');
            result.push([]);
            for (let index: number = 0; index < values.length; ++index) {
                result[dataIndex][keys[index]] = this.GetValue(types[index], values[index]);
            }
            let fileData = this.GetTableObj(TableType);
            let id: any = result[dataIndex][keys[0]];
            fileData.Init(result[dataIndex++]);
            fileContainer.add(id, fileData);
        }
        this._fileMap.set(TableType, fileContainer);
    }

    private GetValue(type: string, value: any): any {
        let result: any;
        switch (type) {
            case 'String':
                result = String(value);
                break;
            case 'Number':
                result = Number(value);
                break;
            case 'Boolean':
                result = Boolean(Number(value));
                break;
            case 'String[]':
                result = [];
                for (let ele of value) {
                    result.push(String(ele));
                }
                break;
            case 'Number[]':
                result = [];
                for (let ele of value) {
                    result.push(Number(ele));
                }
                break;
            case 'Boolean[]':
                result = [];
                for (let ele of value) {
                    result.push(Boolean(Number(ele)));
                }
                break;
            default:
                break;
        }
        return result;
    }

    private GetTableObj(Table: any): any {
        return new Table();
    }
}