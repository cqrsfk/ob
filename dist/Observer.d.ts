/// <reference types="node" />
import { EventEmitter } from "events";
import { MiddlewareConstructor } from "./types/MiddlewareConstructor";
import { Middleware } from "./types/Middleware";
export declare class Observer<T> {
    readonly root: any;
    static Middles: MiddlewareConstructor[];
    emitter: EventEmitter;
    proxy: T;
    private getArr;
    private beforeSetArr;
    private afterSetArr;
    private beforeApplyArr;
    private afterApplyArr;
    private beforeDeleteArr;
    private afterDeleteArr;
    private obj_proxy_map;
    private proxy_path_map;
    private proxy_obj_map;
    private debug;
    constructor(root: any, debugName?: string);
    isProxy(obj: any): boolean;
    private observe;
    use(Middle: Middleware | MiddlewareConstructor): void;
    private readonly statics;
    private get;
    private set;
    private deleteProperty;
    private apply;
}
export declare function factory(): typeof Observer;
