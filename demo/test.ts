import { Observer, factory } from "../src/index";
import { Change } from "../package/ob-middle-change/src/index";
import { Sync, Synchronizer } from "../package/ob-middle-sync/src/index";
import update from "immutability-helper";
import { get, set } from "lodash";

const obj: { map: Map<string, string>, sub: { arr: string[] }, name: string, set: Set<any>, change: (name: string) => void } = {
    name: "hello",
    change(name) {
        this.name = name;
    },
    set: new Set,
    map: new Map,
    sub: { arr: ["1", "2", "333", "44444", "555555"] }
}

const { use, proxy } = new Observer<Synchronizer & typeof obj>(obj);
use(Change);
use(Sync);

function updater(obj, cb: (obj: any) => void) {
    return function (changer) {
        const proto = obj;
        const { isDelete, isFun, isSet, isMap, isArray, key, parentPath, argv, root, path, newValue } = changer;
        if (isArray) {
            switch (key) {
                case "push":
                    obj = update(obj, set({}, parentPath, { $push: argv }))
                    break;
                case "unshift":
                    obj = update(obj, set({}, parentPath, { $unshift: argv }))
                    break;
                case "shift":
                    obj = update(obj, set({}, parentPath, { $splice: [[0, 1]] }))
                    break;
                case "pop":
                    const lastIndex = get(obj as any, parentPath).length - 1;
                    if (lastIndex >= 0) {
                        obj = update(obj, set({}, parentPath, { $splice: [[lastIndex, 1]] }))
                    }
                    break;
                case "reverse":
                    const arr = get(obj as any, parentPath);
                    arr.reverse();
                    obj = update(obj, set({}, parentPath, { $set: [...arr] }))
                    break;
                case "splice":
                    obj = update(obj, set({}, parentPath, { $splice: [argv] }))
                    break;
            }
        } else if (isSet) {
            switch (key) {
                case "add":
                    obj = update(obj, set({}, parentPath, { $add: argv }))
                    break;

                case "clear":
                    obj = update(obj, set({}, parentPath, { $set: new Set }))

                    break;

                case "delete":
                    obj = update(obj, set({}, parentPath, { $remove: argv }))

                    break;

            }
        } else if (isMap) {
            switch (key) {
                case "set":
                    obj = update(obj, set({}, parentPath, { $add: [argv] }))
                    break;

                case "clear":
                    obj = update(obj, set({}, parentPath, { $set: new Map }))

                    break;

                case "delete":
                    obj = update(obj, set({}, parentPath, { $remove: argv }))

                    break;

            }
        } else if (isDelete) {
            const opt = parentPath ? set({}, parentPath, { $unset: [key] }) : { $unset: [key] };
            obj = update(obj, opt);
        } else {
            obj = update(obj, set({}, path, { $set: newValue }))
        }

        cb(obj);

    }
}

let s;
const unsubscribe = proxy.$sync(updater(obj, obj => {
    const e = Date.now() - s;
    console.log(e, obj)
}));
// unsubscribe()
s = Date.now();
// proxy.map.set("aa", "11");

// // proxy.map.set("bb", "22");
// // proxy.map.delete("aa")
// // proxy.map.clear();

proxy.name = "sssss"
delete proxy.sub.arr[1];
s = Date.now();
proxy.sub.arr.splice(1, 1, "hel")