// 这是项目发布阶段需要用到的额babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  // 发布产品的时候用的插件
  plugins: [...prodPlugins]
}
