import DataTable from "./DataTable";

interface IContainer {
    get(id: number): any;
    add(id: any, table: any): void;
    del(id: any): boolean;
    contains(id: any): boolean;
}

export default class FileContainer<T extends DataTable> implements IContainer {
    public length: number;

    constructor() {
        this.length = 0;
    }

    get(id: number): T {
        return this[id];
    }

    add(id: any, value: T): void {
        if (!this[id]) {
            this.length++;
        }
        this[id] = value;
    }

    del(id: any): boolean {
        if (this[id]) {
            delete this[id];
            return true;
        }
        return false;
    }

    contains(id: any): boolean {
        if (this[id] !== null && this[id] !== undefined) {
            return true;
        }
        return false;
    }
}