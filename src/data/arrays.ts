export type Out<T> = { val: T };

export const tryGet = <T>(arr: T[], index: number, out: Out<T>): boolean => {
    if (0 <= index && index < arr.length) {
        out.val = arr[index];
        return true;
    }
    return false;
}