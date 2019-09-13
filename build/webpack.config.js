const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const InjectCDN = require('./InjectCDN')

// webpack plugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const {
  getProjectName,
  getApiEnv,
  rejectRemJs,
  rejectVConsole,
  checkoutValidDir,
  systemExitThrowException,
  getHtmlNameArray,
  getAllEntries,
} = require('../utils')


// 获取当前处理的项目名称
const projectName = getProjectName()

if (!projectName) systemExitThrowException(`project name can not empty, please checkout。 \n`)

// 校验源码目录是否存在
if (!checkoutValidDir(projectName)) {
  systemExitThrowException(`${projectName} is not exist。please checkout。 \n`)
}

// 配置项目的打包入口；自动注入的css、js资源
let entries = {}
const rejectCss = []
const rejectJs = []

// 获取api， 默认dev
const api = getApiEnv()
if(api === 'dev'){
  console.warn('dev:', path.resolve(__dirname, `../config/dev/index.js`))
  entries['config/client.js'] = path.resolve(__dirname, `../config/dev/index.js`)
  rejectJs.push('./config/client.js')
}
// 获取isConsole, 默认不注入
const isConsole = rejectVConsole()
// 获取是否注入rem.js, pc无需注入，移动端注入
const isRem = rejectRemJs()

console.warn('pro:', projectName)
console.warn('api:', api)
console.warn('isConsole:', isConsole)
console.warn('isRem:', isRem)
if(isConsole) {
  rejectJs.push('https://cdn.bootcss.com/vConsole/3.3.4/vconsole.min.js')
}
if(isRem) {
  rejectJs.push('https://cdn.bootcss.com/rem/1.3.4/js/rem.min.js')
  rejectJs.push('https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js')
  rejectCss.push('https://cdn.bootcss.com/normalize/8.0.1/normalize.min.css')
}

const isDev = process.env.NODE_ENV === 'development'
const cssIdentifier = '[local]'
console.warn('isDev:', isDev, process.env.NODE_ENV)

// 获取所有入口文件
const htmlArr = getHtmlNameArray(projectName)
entries = {
  ...entries,
  ...getAllEntries(projectName, htmlArr),
}

console.warn(entries, 'entries')

// webpack 配置
const configBase = require('./webpack.base')
const config = webpackMerge(configBase, {
  mode: isDev ? 'development' : 'production',
  target: 'web',
  entry: entries,
})

// 开发模式
if (isDev) {
  // devtool
  config.devtool = 'source-map';

  // 清空打包项目目录
  config.plugins.push(
    new CleanWebpackPlugin([`dist/${projectName}/`], {
      root: path.resolve(`./`),
      verbose: true,
      dry: false
    })
  );

  // 配置html文件注入规则：入口文件js
  htmlArr.forEach(function(item) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: `${item}.html`,
        template: path.resolve(`./${projectName}`, `${item}.html`),
        hash: true,       // true | false。如果是true，会给所有包含的script和css添加一个唯一的webpack编译hash值。这对于缓存清除非常有用。
        inject: true,     // | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
        chunks: entries[`js/${item}.js`] ? [`js/${item}.js`] : [],   // 使用chunks 需要指定entry 入口文件中的哪一个模块
        minify: {
          caseSensitive:false,//是否大小写敏感              
          collapseWhitespace:true, //是否去除空格               
          removeAttributeQuotes:true, // 去掉属性引用               
          removeComments:true, //去注释
        },
      })
    )
    config.plugins.push(new InjectCDN({
      css: rejectCss,
      js: rejectJs,
    }))
  })

  // 启动 browser-sync 实时热加载
  config.plugins.push(
    new BrowserSyncPlugin({
        server: {
          baseDir: `./dist/${projectName}`,
        },
      }, {
        reload: true,
    })
  )
}

// 生产模式
if (!isDev) {

  config.plugins.push(
    // new webpack.HashedModuleIdsPlugin({
    //   hashFunction: 'sha256',
    //   hashDigest: 'hex',
    //   hashDigestLength: 20
    // }),

    new CleanWebpackPlugin([`dist/${projectName}/`], {
      root: path.resolve('./'),
      verbose: true,
      dry: false
    })
  );

  htmlArr.forEach(function(item) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: `${item}.html`,
        template: path.resolve(`./${projectName}`, `${item}.html`),
        hash: true,       // true | false。如果是true，会给所有包含的script和css添加一个唯一的webpack编译hash值。这对于缓存清除非常有用。
        inject: true,     // | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
        chunks: entries[`js/${item}.js`] ? [`js/${item}.js`] : [],   // 使用chunks 需要指定entry 入口文件中的哪一个模块
        minify: {
          caseSensitive:false,//是否大小写敏感              
          collapseWhitespace:true, //是否去除空格               
          removeAttributeQuotes:true, // 去掉属性引用               
          removeComments:true, //去注释
        },
      })
    )
    // 配置cdn 静态资源
    config.plugins.push(new InjectCDN({
      css: rejectCss,
      js: rejectJs,
    }))
  })

  // 启动 browser-sync 实时热加载
  config.plugins.push(
    new BrowserSyncPlugin({
      server: {
        baseDir: `./dist/${projectName}`,
      },
    }, {
      reload: true,
    })
  )
}

module.exports = config;
