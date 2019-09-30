"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sync {
    constructor(ob) {
        this.ob = ob;
        this.updaters = [];
        ob.emitter.on("change", event => this.updaters.forEach(updater => updater(event)));
        this.$sync = this.$sync.bind(this);
        this.get = this.get.bind(this);
    }
    $sync(updater) {
        this.updaters.push(updater);
        return () => this.$stopSync(updater);
    }
    $stopSync(updater) {
        if (updater) {
            const set = new Set(this.updaters);
            set.delete(updater);
            this.updaters = [...set];
        }
        else {
            this.updaters = [];
        }
    }
    get({ root, path, parent, key, value, ob }) {
        if (root === parent && key === "$sync") {
            return this.$sync;
        }
        return value;
    }
}
exports.Sync = Sync;
//# sourceMappingURL=index.js.map