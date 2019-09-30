export declare class Change {
    private suspend;
    constructor(ob: any);
    beforeApply(argv: any, newArgv: any): any;
    afterApply(argv: any): any;
    afterSet(argv: any): void;
    afterDelete(argv: any): void;
}
