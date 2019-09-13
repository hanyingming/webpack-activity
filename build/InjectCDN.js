class InjectCDN {
  constructor (options) {
    const defaultOpt = {
      js: [],
      css: [],
    }
    this.options = Object.assign(defaultOpt, options)
  }

  // 处理方法
  apply (compiler) {
    // webpack3.x
    compiler.plugin('compilation', compilation => {
      compilation.plugin(
        'html-webpack-plugin-before-html-processing',
        (htmlPluginData, callback) => {
          // console.warn('htmlPluginData:', htmlPluginData)
          // 将css 注入
          htmlPluginData.assets.css = this.options.css.concat(htmlPluginData.assets.css)
          // 将js 注入
          htmlPluginData.assets.js = this.options.js.concat(htmlPluginData.assets.js)
          if (callback) {
            return callback(null, htmlPluginData)
          } else {
            return Promise.resolve(htmlPluginData)
          }
        }
      )
    })
  }
}
module.exports = InjectCDN
