"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const globalThis_1 = require("./globalThis");
class Observer {
    constructor(root) {
        this.root = root;
        this.getArr = [];
        this.beforeSetArr = [];
        this.afterSetArr = [];
        this.beforeApplyArr = [];
        this.afterApplyArr = [];
        this.beforeDeleteArr = [];
        this.afterDeleteArr = [];
        this.obj_proxy_map = new WeakMap();
        this.proxy_path_map = new WeakMap();
        this.proxy_obj_map = new WeakMap();
        this.emitter = new events_1.EventEmitter();
        this.use = this.use.bind(this);
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.apply = this.apply.bind(this);
        this.deleteProperty = this.deleteProperty.bind(this);
        this.proxy = this.observe(root);
        this.obj_proxy_map.set(root, this.proxy);
        this.proxy_path_map.set(this.proxy, "");
        this.statics.Middles.forEach(Middle => this.use(new Middle(this)));
    }
    isProxy(obj) {
        return this.proxy_path_map.has(obj);
    }
    observe(target) {
        return new Proxy(target, {
            get: this.get,
            set: this.set,
            apply: this.apply,
            deleteProperty: this.deleteProperty
        });
    }
    use(Middle) {
        let middle;
        if (typeof Middle === "function") {
            middle = new Middle(this);
        }
        else {
            middle = Middle;
        }
        const { get, beforeSet, afterSet, beforeApply, afterApply, beforeDelete, afterDelete } = middle;
        get && this.getArr.push(get.bind(middle));
        beforeSet && this.beforeSetArr.push(beforeSet.bind(middle));
        afterSet && this.afterSetArr.push(afterSet.bind(middle));
        beforeApply && this.beforeApplyArr.push(beforeApply.bind(middle));
        afterApply && this.afterApplyArr.push(afterApply.bind(middle));
        beforeDelete && this.beforeDeleteArr.push(beforeDelete.bind(middle));
        afterDelete && this.afterDeleteArr.push(afterDelete.bind(middle));
    }
    get statics() {
        return this.constructor;
    }
    get(target, key) {
        const node = target[key];
        if (typeof key === "symbol")
            return node;
        let path;
        let pnode;
        const parentProxy = this.obj_proxy_map.get(target);
        const parentPath = this.proxy_path_map.get(parentProxy);
        if (node && (typeof node === "object" || typeof node === "function")) {
            pnode = this.obj_proxy_map.get(node);
            if (pnode) {
                path = this.proxy_path_map.get(pnode);
            }
            else {
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
    set(target, key, value) {
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
    deleteProperty(target, key) {
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
            if (!pass)
                return false;
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
                ob: this
            });
        }
        return pass;
    }
    apply(fn, pparent, argv) {
        const pfn = this.obj_proxy_map.get(fn);
        const parentPath = this.proxy_path_map.get(pparent);
        const path = this.proxy_path_map.get(pfn);
        const key = path.split(".").pop();
        const parent = this.proxy_obj_map.get(pparent);
        const isArray = pparent.constructor.name === "Array";
        const isNative = pparent.constructor.name !== "Object" &&
            !isArray &&
            pparent.constructor.name in globalThis_1.globalThis;
        let newArgv = argv;
        const beforeApplyArr = this.beforeApplyArr;
        for (let middle of beforeApplyArr) {
            newArgv = middle({
                root: this.root,
                path,
                parentPath,
                parent,
                fn,
                key,
                argv,
                isArray,
                isNative,
                newArgv,
                ob: this
            });
        }
        let result, newResult;
        if (isNative) {
            newResult = result = Reflect.apply(fn, parent, argv);
        }
        else {
            newResult = result = Reflect.apply(fn, pparent, argv);
        }
        const afterApplyArr = this.afterApplyArr;
        for (let middle of afterApplyArr) {
            newResult = middle({
                root: this.root,
                path,
                parentPath,
                parent,
                fn,
                key,
                argv,
                newArgv: argv,
                isArray,
                isNative,
                result,
                newResult,
                ob: this
            });
        }
        return newResult;
    }
}
Observer.Middles = [];
exports.Observer = Observer;
function factory() {
    class NewObserver extends Observer {
        constructor(target) {
            super(target);
        }
    }
    NewObserver.Middles = [];
    return NewObserver;
}
exports.factory = factory;
//# sourceMappingURL=Observer.js.map