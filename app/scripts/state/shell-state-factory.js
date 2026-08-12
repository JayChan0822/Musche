// shell state 通用工厂：把"ctx 映射壳"收敛为一份声明式依赖清单。
// spec 条目是「依赖路径」字符串，路径根是组合根传进来的 resolve（见 services/app-root-context-wiring.js）：
//   'refs.isMobile'、'helpers.mobileTouchHandlers.handleTouchEnd'、'utils.formatUtils.formatSecs'、'shells.appEditModal'
// ctx 上的键名默认取路径最后一段；需要改名时写成 ['ctxKey', '依赖路径']。
// 三种 bucket：
//   reads  —— 只读 ref：访问时解析路径后返回 .value
//   models —— 可写 ref（v-model）：getter 读 .value，setter 写回
//   values —— 直传：访问时返回解析结果本身（action 函数、子 ctx、reactive 容器、可被整体替换的属性）
// 三种 bucket 一律**每次访问才解析**：组合根晚到的值（懒加载 feature 回填、后注册的 feature）天然可见，
// 不会像"创建时一次性解构"那样把旧引用永久钉死在 ctx 上。
export function defineShellState(factoryName, spec) {
    if (typeof factoryName !== 'string' || !factoryName) {
        throw new TypeError('defineShellState requires a factory name');
    }
    if (!spec || typeof spec !== 'object') {
        throw new TypeError('defineShellState requires a dependency spec object');
    }

    const { reads = [], models = [], values = [] } = spec;

    return function createShellState({ reactive, resolve } = {}) {
        if (typeof reactive !== 'function') {
            throw new TypeError(`${factoryName} requires Vue reactive factory`);
        }
        if (typeof resolve !== 'function') {
            throw new TypeError(`${factoryName} requires a dependency resolver`);
        }

        const target = {};
        const requireRef = (path) => {
            const source = resolve(path);
            if (!source) {
                throw new TypeError(`${factoryName}: 依赖 "${path}" 没有发布到 assembly`);
            }
            return source;
        };
        const define = (entry, describe) => {
            const [key, path] = normalizeEntry(factoryName, entry);
            Object.defineProperty(target, key, {
                enumerable: true,
                configurable: true,
                ...describe(path),
            });
        };

        for (const entry of values) {
            define(entry, (path) => ({ get: () => resolve(path) }));
        }
        for (const entry of reads) {
            define(entry, (path) => ({ get: () => requireRef(path).value }));
        }
        for (const entry of models) {
            define(entry, (path) => ({
                get: () => requireRef(path).value,
                set: (value) => { requireRef(path).value = value; },
            }));
        }

        return reactive(target);
    };
}

function normalizeEntry(factoryName, entry) {
    if (typeof entry === 'string') {
        return [entry.slice(entry.lastIndexOf('.') + 1), entry];
    }
    if (Array.isArray(entry) && entry.length === 2 && entry.every((part) => typeof part === 'string')) {
        return entry;
    }
    throw new TypeError(`${factoryName} spec entries must be a dependency path or a [ctxKey, path] pair`);
}
