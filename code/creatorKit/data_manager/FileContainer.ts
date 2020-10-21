import DataTable from "./DataTable";

interface IContainer {
    Get(id: number): any;
    Add(id: any, table: any): void;
    Del(id: any): boolean;
    Contains(id: any): boolean;
}

export default class FileContainer<T extends DataTable> implements IContainer {
    public length: number;

    constructor() {
        this.length = 0;
    }

    Get(id: number): T {
        return this[id];
    }

    Add(id: any, value: T): void {
        if (!this[id]) {
            this.length++;
        }
        this[id] = value;
    }

    Del(id: any): boolean {
        if (this[id]) {
            delete this[id];
            return true;
        }
        return false;
    }

    Contains(id: any): boolean {
        if (this[id] !== null && this[id] !== undefined) {
            return true;
        }
        return false;
    }
}