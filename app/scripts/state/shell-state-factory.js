// shell state 通用工厂：把"ctx 映射壳"收敛为声明式 spec。
// spec 四种 bucket：
//   reads  —— 只读 ref：访问时返回 source.value
//   models —— 可写 ref（v-model）：getter 读 source.value，setter 写回
//   raw    —— 延迟取值：每次访问执行 thunk（来源属性可能被重新赋值）
//   values —— 直传属性：创建时取值一次（action 函数、子 ctx 透传、常量）
export function defineShellState(factoryName, buildSpec) {
    if (typeof factoryName !== 'string' || !factoryName) {
        throw new TypeError('defineShellState requires a factory name');
    }
    if (typeof buildSpec !== 'function') {
        throw new TypeError('defineShellState requires a spec builder function');
    }

    return function createShellState({ reactive, ...sources } = {}) {
        if (typeof reactive !== 'function') {
            throw new TypeError(`${factoryName} requires Vue reactive factory`);
        }

        const { reads = {}, models = {}, raw = {}, values = {} } = buildSpec(sources) || {};
        const target = {};

        Object.assign(target, values);
        for (const [key, source] of Object.entries(reads)) {
            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: true,
                get: () => source.value,
            });
        }
        for (const [key, source] of Object.entries(models)) {
            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: true,
                get: () => source.value,
                set: (value) => { source.value = value; },
            });
        }
        for (const [key, getValue] of Object.entries(raw)) {
            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: true,
                get: getValue,
            });
        }

        return reactive(target);
    };
}
