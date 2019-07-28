class MVVM {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        // 数据劫持
        new Observer(this.$data);
        // 实现 vm.message 等同于 vm.$data.message
        Object.keys(this.$data).forEach(key => {
            Object.defineProperty(this, key, {
                get: function () {
                    return this.$data[key];
                },
                set: function (newValue) {
                    this.$data[key] = newValue;
                },
                enumerable: true,
                configurable: true
            });
        });
        // 编译模版
        new Compile(this.$el, this);
    }
}