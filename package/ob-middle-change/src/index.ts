export class Change {
  private suspend: boolean = false;
  constructor(ob) {
    this.afterApply = this.afterApply.bind(this);
    this.afterSet = this.afterSet.bind(this);
  }

  beforeApply(argv, newArgv) {
    if (newArgv.isArray) this.suspend = true;
    return newArgv;
  }

  afterApply(argv) {
    if (argv.isNative || argv.isArray) {
      argv.ob.emitter.emit("change", { ...argv, isFun: true });
      this.suspend = false;
    }
    return argv.newResult;
  }
  afterSet(argv) {
    if (this.suspend) return;
    argv.ob.emitter.emit("change", argv);
  }
}
