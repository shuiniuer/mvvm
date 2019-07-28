class Compile {
    constructor(el, vm) {
        this.$el = el;
        this.vm = vm;
        // 把node节点放在fragment中
        let fragment = this.node2fragment(this.$el);
        this.compile(fragment);
        this.$el.appendChild(fragment);
    }
    // 核心编译方法
    compile(fragment) {
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 编译 node 元素上的指令
                this.compileElement(node);
                // 继续编译 node 元素的子元素
                this.compile(node);
            } else {
                // 编译文本节点
                this.compileText(node);
            }
        });
    }
    compileElement(node) {
        // 编译 v-model 等指令
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let expr = attr.value;
                let [, type] = attrName.split('-');
                this.compileUtil[type](node, this.vm, expr);
            }
        });
    }
    compileText(node) {
        let expr = node.textContent;
        let reg = /\{\{([^{^}]+)\}\}/g;
        if (reg.test(expr)) {
            this.compileUtil['text'](node, this.vm, expr)
        }
    }
    compileUtil = {
        getVal(vm, expr) {
            expr = expr.split('.');
            return expr.reduce((pre, next) => {
                return pre[next];
            }, vm.$data);
        },
        getTextVal(vm, expr) {
            let value = expr.replace(/\{\{([^{^}]+)\}\}/g, (...arg) => {
                return this.getVal(vm, arg[1]);
            });
            return value;
        },
        text(node, vm, expr) {
            let updateFn = this.updater['textUpdater'];
            let value = this.getTextVal(vm, expr);

            // 文本节点绑定watcher
            expr.replace(/\{\{([^{^}]+)\}\}/g, (...arg) => {
                new Watcher(vm, arg[1], () => {
                    updateFn(node, this.getTextVal(vm, expr));
                });
            });
            updateFn(node, value);
        },
        setVal(vm, expr, value) {
            expr = expr.split('.');
            return expr.reduce((pre, next, currentIndex) => {
                if (currentIndex === expr.length - 1) {
                    pre[next] = value;
                }
                return pre[next];
            }, vm.$data);
        },
        model(node, vm, expr) {
            let updateFn = this.updater['modelUpdater'];
            let value = this.getVal(vm, expr);

            // v-model 指令 绑定 Watcher
            new Watcher(vm, expr, () => {
                updateFn(node, this.getVal(vm, expr));
            });
            updateFn(node, value);

            // 输入框双向绑定
            node.addEventListener('input', (e) => {
                let newValue = e.target.value;
                this.setVal(vm, expr, newValue);
            });
        },
        updater: {
            textUpdater(node, value) {
                node.textContent = value;
            },
            modelUpdater(node, value) {
                node.value = value;
            }
        }
    }
    // 辅助方法
    isDirective(name) {
        return name.includes('v-');
    }
    isElementNode(node) {
        return node.nodeType === 1;
    }
    node2fragment(el) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 依次取出el的全部子节点
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
}