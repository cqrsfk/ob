import { EventEmitter } from "events";
import { globalThis } from "./globalThis";
import { MiddlewareConstructor } from "./types/MiddlewareConstructor";
import Debug from "debug";


import {
  Middleware,
  GetMiddle,
  BeforeSetMiddle,
  AfterSetMiddle,
  BeforeApplyMiddle,
  AfterApplyMiddle,
  BeforeDeleteMiddele,
  AfterDeleteMiddle
} from "./types/Middleware";

const rootkey = Symbol.for("root");

export class Observer<T> {
  public static Middles: MiddlewareConstructor[] = [];

  public emitter: EventEmitter;
  public proxy: T;

  private getArr: GetMiddle[] = [];
  private beforeSetArr: BeforeSetMiddle[] = [];
  private afterSetArr: AfterSetMiddle[] = [];
  private beforeApplyArr: BeforeApplyMiddle[] = [];
  private afterApplyArr: AfterApplyMiddle[] = [];
  private beforeDeleteArr: BeforeDeleteMiddele[] = [];
  private afterDeleteArr: AfterDeleteMiddle[] = [];

  private obj_proxy_map = new WeakMap();
  private proxy_path_map = new WeakMap();
  private proxy_obj_map = new WeakMap();
  private debug;

  constructor(private readonly root: any, debugName: string = "default") {
    this.emitter = new EventEmitter();
    this.use = this.use.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.apply = this.apply.bind(this);
    this.deleteProperty = this.deleteProperty.bind(this);
    this.proxy = this.observe(root);
    this.obj_proxy_map.set(root, this.proxy);
    this.proxy_path_map.set(this.proxy as any, "");
    this.statics.Middles.forEach(Middle => this.use(new Middle(this)));
    this.debug = Debug("Observer" + ":" + debugName);
  }

  public isProxy(obj) {
    return this.proxy_path_map.has(obj);
  }

  private observe(target) {
    return new Proxy(target, {
      get: this.get,
      set: this.set,
      apply: this.apply,
      deleteProperty: this.deleteProperty
    });
  }

  public use(Middle: Middleware | MiddlewareConstructor) {
    let middle: Middleware;
    if (typeof Middle === "function") {
      middle = new Middle(this);
    } else {
      middle = Middle;
    }
    const {
      get,
      beforeSet,
      afterSet,
      beforeApply,
      afterApply,
      beforeDelete,
      afterDelete
    } = middle;
    get && this.getArr.push(get.bind(middle));
    beforeSet && this.beforeSetArr.push(beforeSet.bind(middle));
    afterSet && this.afterSetArr.push(afterSet.bind(middle));
    beforeApply && this.beforeApplyArr.push(beforeApply.bind(middle));
    afterApply && this.afterApplyArr.push(afterApply.bind(middle));
    beforeDelete && this.beforeDeleteArr.push(beforeDelete.bind(middle));
    afterDelete && this.afterDeleteArr.push(afterDelete.bind(middle));
  }

  private get statics() {
    return this.constructor as typeof Observer;
  }

  private get proto() {
    const root = this.root;
    let root2;
    return root2 = root[rootkey] ? root2 : root;
  }

  private get(target, key): any {

    let path;
    let pnode;
    const parentProxy = this.obj_proxy_map.get(target);
    const parentPath = this.proxy_path_map.get(parentProxy);

    if (key === rootkey && !parentPath) {
      return this.proto;
    }

    const node = target[key];


    if (
      ["prototype", "constructor"].includes(key) ||
      typeof key === "symbol" ||
      typeof node === "function" &&
      (
        (key in Object.prototype && node === Object.prototype[key]) ||
        (key in Function.prototype && node === Function.prototype[key])
      )
    ) {
      return node;
    }

    if (node && (typeof node === "object" || typeof node === "function")) {
      pnode = this.obj_proxy_map.get(node);
      if (pnode) {
        path = this.proxy_path_map.get(pnode);

      } else {
        path = parentPath ? parentPath + "." + key : key;

        pnode = this.observe(node);
        this.obj_proxy_map.set(node, pnode);
        this.proxy_path_map.set(pnode, path);
        this.proxy_obj_map.set(pnode, node);
      }
    }

    let value = pnode || node;
    const getArr = this.getArr;

    for (let middle of getArr) {
      value = middle({
        root: this.root,
        parentPath,
        path,
        parent: target,
        key,
        value,
        ob: this
      });
    }
    return value;
  }

  private set(target, key, value) {
    let ptarget = this.obj_proxy_map.get(target);
    let parentPath = this.proxy_path_map.get(ptarget);
    const beforeSetArr = this.beforeSetArr;
    let newValue = value;
    for (let middle of beforeSetArr) {
      newValue = middle({
        root: this.root,
        path: parentPath ? parentPath + "." + key : key,
        parentPath,
        parent: target,
        key,
        value,
        newValue,
        ob: this
      });
    }

    target[key] = newValue;
    const afterSetArr = this.afterSetArr;
    for (let middle of afterSetArr) {
      newValue = middle({
        root: this.root,
        path: parentPath ? parentPath + "." + key : key,
        parentPath,
        parent: target,
        key,
        value,
        newValue,
        ob: this
      });
    }

    return true;
  }

  private deleteProperty(target, key): boolean {
    const ptarget = this.obj_proxy_map.get(target);
    const parentPath = this.proxy_path_map.get(ptarget);
    const beforeDeleteArr = this.beforeDeleteArr;
    for (let middle of beforeDeleteArr) {
      let pass = middle({
        root: this.root,
        path: parentPath ? parentPath + "." + key : key,
        parentPath,
        key,
        parent: target,
        ob: this
      });

      if (!pass) return false;
    }

    const pass = Reflect.deleteProperty(target, key);
    const afterDeleteArr = this.afterDeleteArr;
    for (let middle of afterDeleteArr) {
      middle({
        root: this.root,
        path: parentPath ? parentPath + "." + key : key,
        parentPath,
        key,
        parent: target,
        isDelete: true,
        ob: this
      });
    }
    return pass;
  }

  private apply(fn, pparent, argv: any[]) {
    const pfn = this.obj_proxy_map.get(fn);

    // const parentPath = this.proxy_path_map.get(pparent);

    const path = this.proxy_path_map.get(pfn) as string;
    const pathItems = path.split(".");
    let parentPath: string = "";
    if (pathItems.length !== 1) {
      pathItems.pop();
      parentPath = pathItems.join(".");
    }
    this.debug("#apply parentPath = ", parentPath);
    this.debug("#apply path = ", path);
    const key = path.split(".").pop() || "";
    const parent = this.proxy_obj_map.get(pparent);
    const isArray = pparent.constructor.name === "Array";
    const isSet = pparent instanceof Set;
    const isMap = pparent instanceof Map;
    const isNative =
      pparent.constructor.name !== "Object" &&
      !isArray &&
      pparent.constructor.name in globalThis;

    const beforeApplyArr = this.beforeApplyArr;

    let nativeArgv = {
      root: this.root,
      path,
      parentPath,
      parent,
      fn,
      key,
      argv,
      isArray,
      isNative,
      isSet, isMap,
      ob: this as Observer<T>
    };

    let newArgv = nativeArgv;

    for (let middle of beforeApplyArr) {
      newArgv = middle(nativeArgv, newArgv);
    }

    let result, newResult;
    if (isNative) {
      newResult = result = Reflect.apply(
        newArgv.fn,
        newArgv.parent,
        newArgv.argv
      );
    } else {
      newResult = result = Reflect.apply(newArgv.fn, pparent, newArgv.argv);
    }

    const afterApplyArr = this.afterApplyArr;

    for (let middle of afterApplyArr) {
      newResult = middle({
        ...newArgv,
        result,
        newResult,
        argv: nativeArgv.argv,
        newArgv: newArgv.argv
      });
    }

    return newResult;
  }
}

export function factory(): typeof Observer {
  class NewObserver<T> extends Observer<T> {
    public static Middles: MiddlewareConstructor[] = [];

    constructor(target: T) {
      super(target);
    }
  }
  return NewObserver;
}
