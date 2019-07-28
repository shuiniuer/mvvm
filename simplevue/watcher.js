class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 先获取一下旧值
        this.value = this.get();
    }
    get() {
        Dep.target = this;
        let value = this.getVal(this.vm, this.expr);
        Dep.target = null;
        return value;
    }
    getVal(vm, expr) {
        expr = expr.split('.');
        // 触发 data [expr] 的 get方法
        return expr.reduce((pre, next) => {
            return pre[next];
        }, vm.$data);
    }
    // 对外暴露的 update 方法
    // 当数据变化后
    // 用新值和旧值进行比对
    // 如果发现两个值不一样 则执行更新的回调函数
    update() {
        let newValue = this.getVal(this.vm, this.expr);
        let oldValue = this.value;
        if (newValue != oldValue) {
            this.cb();
        }
    }
}