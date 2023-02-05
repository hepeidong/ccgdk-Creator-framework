export function has(obj: any, key: string) {
    return key in obj;
}

export function removeElement(array: any[], i: number, len?: number) {
    if (i < array.length - 1) {
        array[i] = array[array.length - 1];
    }
    delete array[array.length - 1];
    array.length--;
    if (typeof len === 'number') {
        len = array.length;
    }
    i--;
    return {i, len};
}

export function entityIndexOf(array: IEntity[], member: IEntity) {
    for (let i: number = 0, len = array.length; i < len; ++i) {
        if (array[i].ID === member.ID) {
            return i;
        }
    }
    return -1;
}

export enum SystemGroupType {
    initialization = 'initialization',
    simulation = 'simulation',
    presentation = 'presentation',
    custom = 'custom'
}