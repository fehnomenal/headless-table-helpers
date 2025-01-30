export type OneProp<T> = {
    [K in keyof T]: Record<K, T[K]>;
}[keyof T];
type AllKeys<T> = T extends any ? keyof T : never;
export type ExclusifyUnion<T, K extends AllKeys<T> = AllKeys<T>> = T extends any ? T & Partial<Record<Exclude<K, keyof T>, never>> extends infer O ? {
    [P in keyof O]: O[P];
} : never : never;
export {};
