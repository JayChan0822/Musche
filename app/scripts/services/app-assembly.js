// 组合根的装配上下文：feature 接线适配器（*-feature-registrar / *-feature-loader）
// 从这里取 refs/state/helpers，并把注册结果挂到 features 上。
//
// 规约：
// - refs/state 由 app.js 在创建 store 与各 state 工厂后合并进来，接线模块自行解构；
// - 跨 feature 引用存在注册顺序问题，必须延迟取值：
//   写 `(...args) => assembly.helpers.xxx(...args)` 或 `assembly.features.xxx.method(...)`，
//   禁止在接线模块顶部把 helpers/features 的成员解构成局部常量。
export function createAppAssembly({ vue, utils, services } = {}) {
    if (!vue || !utils || !services) {
        throw new TypeError('createAppAssembly requires vue, utils, and services buckets');
    }
    return {
        vue,
        utils,
        services,
        refs: {},
        state: {},
        features: {},
        helpers: {},
    };
}
