export declare type Synchronizer = {
    $sync(update: (any: any) => void): () => () => void;
    $stopSync(updater?: () => void): void;
};
export declare class Sync {
    private ob;
    private updaters;
    constructor(ob: any);
    $sync(updater: any): () => void;
    $stopSync(updater?: any): void;
    get({ root, path, parent, key, value, ob }: {
        root: any;
        path: any;
        parent: any;
        key: any;
        value: any;
        ob: any;
    }): any;
}
