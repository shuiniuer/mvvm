class Observer {
    constructor(data) {
        this.observe(data);
    }
    observe(data) {
        Object.keys(data).forEach(key => {
            let value = data[key];
            // 给 data 的每一个属性都添加一个订阅
            let dep = new Dep();
            Object.defineProperty(data, key, {
                get() {
                    // 把 watcher 添加到 当前属性的订阅中去
                    Dep.target && dep.addSub(Dep.target);
                    return value;
                },
                set(newValue) {
                    value = newValue;

                    // 当前属性发生更新时 触发订阅中的回调
                    dep.notify();

                    if (value instanceof Object) {
                        this.observe(value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            if (value instanceof Object) {
                this.observe(value);
            }
        });
    }
}
class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach(watcher => {
            watcher.update();
        });
    }
}