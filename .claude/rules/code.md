1. 项目使用 less
2. 项目不适用原子化css
3. 模块下的组件统一放入 components 文件夹并且统一从 index.ts 以 export * from './bar' 可以保持具名导出
eg: 
- src/foo/index.tsx
- src/foo/components/index.ts
- src/foo/components/bar/index.tsx
- src/foo/components/bar/index.less
4. 项目中的统一组件的 less 一般和 tsx 在同级
5. 公共组件放在 src/comopnents
6. 应该总使用 barz/index.tsx 和 barz/index.less 的结构而不是同时出现例如 barz.less 和 barz.tsx 文件但是没有文件夹