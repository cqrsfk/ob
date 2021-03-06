import { Observer } from "../Observer";
export declare type GetMiddle = (argv: {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    key: string;
    value: any;
    ob: Observer<any>;
}) => any;
export declare type BeforeSetMiddle = (argv: {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    key: string;
    value: any;
    newValue: any;
    ob: Observer<any>;
}) => any;
export declare type AfterSetMiddle = (argv: {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    key: string;
    value: any;
    newValue: any;
    ob: Observer<any>;
}) => void;
export declare type BeforeApplyMiddle = (argv: {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    fn: any;
    isNative: boolean;
    isArray: boolean;
    isSet: boolean;
    isMap: boolean;
    key: string;
    argv: any[];
    ob: Observer<any>;
}, newArgv: {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    fn: any;
    isNative: boolean;
    isArray: boolean;
    isSet: boolean;
    isMap: boolean;
    key: string;
    argv: any[];
    ob: Observer<any>;
}) => {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    fn: any;
    isNative: boolean;
    isArray: boolean;
    isSet: boolean;
    isMap: boolean;
    key: string;
    argv: any[];
    ob: Observer<any>;
};
export declare type AfterApplyMiddle = (argv: {
    root: any;
    path: string;
    parentPath: string;
    parent: any;
    fn: any;
    key: string;
    isNative: boolean;
    isArray: boolean;
    argv: any[];
    newArgv: any[];
    isSet: boolean;
    isMap: boolean;
    result: any;
    newResult: any;
    ob: Observer<any>;
}) => any;
export declare type BeforeDeleteMiddele = (argv: {
    root: any;
    path: string;
    parentPath: string;
    key: string;
    parent: any;
    ob: Observer<any>;
}) => boolean;
export declare type AfterDeleteMiddle = (argv: {
    root: any;
    path: string;
    parentPath: string;
    key: string;
    parent: any;
    isDelete: boolean;
    ob: Observer<any>;
}) => void;
export interface Middleware {
    get?: GetMiddle;
    beforeSet?: BeforeSetMiddle;
    afterSet?: AfterSetMiddle;
    beforeApply?: BeforeApplyMiddle;
    afterApply?: AfterApplyMiddle;
    beforeDelete?: BeforeDeleteMiddele;
    afterDelete?: AfterDeleteMiddle;
}
