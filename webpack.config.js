const path = require('path')
const fs = require("fs")
const webpack = require('webpack')
const yargs = require('yargs')
const glob = require('globby')

// 定义基本样式 用于命令提示
const styles = {
  'bold'          : ['\x1B[1m',  '\x1B[22m'],
  'italic'        : ['\x1B[3m',  '\x1B[23m'],
  'underline'     : ['\x1B[4m',  '\x1B[24m'],
  'inverse'       : ['\x1B[7m',  '\x1B[27m'],
  'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
  'white'         : ['\x1B[37m', '\x1B[39m'],
  'grey'          : ['\x1B[90m', '\x1B[39m'],
  'black'         : ['\x1B[30m', '\x1B[39m'],
  'blue'          : ['\x1B[34m', '\x1B[39m'],
  'cyan'          : ['\x1B[36m', '\x1B[39m'],
  'green'         : ['\x1B[32m', '\x1B[39m'],
  'magenta'       : ['\x1B[35m', '\x1B[39m'],
  'red'           : ['\x1B[31m', '\x1B[39m'],
  'yellow'        : ['\x1B[33m', '\x1B[39m'],
  'whiteBG'       : ['\x1B[47m', '\x1B[49m'],
  'greyBG'        : ['\x1B[49;5;8m', '\x1B[49m'],
  'blackBG'       : ['\x1B[40m', '\x1B[49m'],
  'blueBG'        : ['\x1B[44m', '\x1B[49m'],
  'cyanBG'        : ['\x1B[46m', '\x1B[49m'],
  'greenBG'       : ['\x1B[42m', '\x1B[49m'],
  'magentaBG'     : ['\x1B[45m', '\x1B[49m'],
  'redBG'         : ['\x1B[41m', '\x1B[49m'],
  'yellowBG'      : ['\x1B[43m', '\x1B[49m']
};

// 获取 命令窗口输入数据
const argv = yargs.argv;
if (!argv || !argv.projectName || argv.projectName === true) {
   // 无项目名称直接抛出错误，程序终止。
   console.error(styles.redBG[0], `projectName is not write, now it is ${argv.projectName || ''}, please checkout。 \n`);
   process.exit(1);
   return;
}

// 获取当前处理的项目名称
const projectName = argv.projectName;

// 校验源码目录是否存在
const dirExist = fs.existsSync(path.join(__dirname, projectName))
if (!dirExist) {
  console.error(styles.redBG[0], `${projectName} is not exist。please checkout。 \n`);
  process.exit(1);
return;
}

// webpack plugin
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDev = process.env.NODE_ENV === 'development'
const cssIdentifier = '[local]'

console.warn('projectName', projectName)
console.warn('isDev: ', isDev)

const configs = []

// html 入口配置
const HTML_PATH = {
  pattern: [`./${projectName}/*.html`],
  src: path.join(__dirname, `${projectName}`),
}

// 获取所有根目录下的html文件名称集合
function getHtmlFileNames(config) {
  const fileList = glob.sync(config.pattern)
  return fileList.map(function(item) {
    const filePath = path.parse(path.relative(config.src, item))
    return filePath.name
  })
}

// 所有匹配的html文件名称集合
const htmlArr = getHtmlFileNames(HTML_PATH)

// 需要索引的入口文件匹配模式
const JsPatternArr = htmlArr.map(item => `./${projectName}/js/${item}.js`)
// js 入口配置 => 仅 自动匹配 项目/js 目录下的入口文件
const JS_PATH = {
  pattern: JsPatternArr,
  src: path.join(__dirname, `${projectName}`),
  dst: path.resolve(__dirname, `dist/${projectName}`),
}

// 遍历所有匹配的文件路径
function getJsEntries(config) {
  const fileList = glob.sync(config.pattern)
  return fileList.reduce(function (previous, current) {
     const filePath = path.parse(path.relative(config.src, current))
     const withoutSuffix = path.join(filePath.dir, `${filePath.name}.${filePath.dir}`).replace(/\\/g, '/')
     previous[withoutSuffix] = path.resolve(__dirname, current).replace(/\\/g, '/')
     return previous
  }, {})
}

// 遍历所有入口文件
const entrys = getJsEntries(JS_PATH);

console.warn(entrys, 'entrys')

// webpack配置
const configJs = {
  mode: 'none',
  entry: entrys,
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, `dist/${projectName}`),
    publicPath: `./`,
  },
  resolve: {
    modules: [
      path.resolve(projectName),
      path.resolve('node_modules')
    ],
    'extensions': ['.js', '.css', '.less']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, `${projectName}`),
        ],
        exclude: [
          path.resolve('node_modules'),
        ],
        use:[
          {
            loader: 'babel-loader'
          }
        ],
      },
      {
        test: /\.css$/,
        use: [
          // { loader: 'file-loader' },
          {
            loader: 'style-loader'
          },
          // { loader: 'css-loader', options: { modules: false, importLoaders: 1 } },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {           // 如果没有options这个选项将会报错 No PostCSS Config found
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('autoprefixer')(), //CSS浏览器兼容
                require('cssnano')()  //压缩css
              ]
            }
          }]
      },
      {
        test: /\.less$/,
        use:ExtractTextPlugin.extract({
          use:[
            {
              loader:'css-loader'
            }, {
              loader:'less-loader'
            }
          ],
          fallback:'style-loader'
        })
    },

    ]
  },

  plugins: [
    new ExtractTextPlugin({
      filename: `[name]`
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
      canPrint: true
    }),
  ]
};

// 开发模式
if (isDev) {
  configJs.mode = 'development';

  // devtool
  configJs.devtool = 'source-map';

  // 清空打包项目目录
  configJs.plugins.push(
    new CleanWebpackPlugin([`dist/${projectName}/`], {
      root: path.resolve(`./`),
      verbose: true,
      dry: false
    })
  );

  // 配置html文件注入规则：入口文件js
  htmlArr.forEach(function(item) {
    configJs.plugins.push(
      new HtmlWebpackPlugin({
        filename: `${item}.html`,
        template: path.resolve(`./${projectName}`, `${item}.html`),
        hash: true,       // true | false。如果是true，会给所有包含的script和css添加一个唯一的webpack编译hash值。这对于缓存清除非常有用。
        inject: true,     // | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
        chunks: entrys[`js/${item}.js`] ? [`js/${item}.js`] : [],   // 使用chunks 需要指定entry 入口文件中的哪一个模块
        minify: {
          removeComments: true,caseSensitive:false,//是否大小写敏感              
          collapseWhitespace:true, //是否去除空格               
          removeAttributeQuotes:true, // 去掉属性引用               
          removeComments:true, //去注释
        },
      })
    )
  })

  // 启动 browser-sync 实时热加载
  configJs.plugins.push(
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
  configJs.mode = 'production';

  configJs.plugins.push(
    new webpack.HashedModuleIdsPlugin(),

    new CleanWebpackPlugin([`dist/${projectName}/`], {
      root: path.resolve('./'),
      verbose: true,
      dry: false
    })
  );

  htmlArr.forEach(function(item) {
    configJs.plugins.push(
      new HtmlWebpackPlugin({
        filename: `${item}.html`,
        template: path.resolve(`./${projectName}`, `${item}.html`),
        hash: true,       // true | false。如果是true，会给所有包含的script和css添加一个唯一的webpack编译hash值。这对于缓存清除非常有用。
        inject: true,     // | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
        chunks: [`css/${item}.css`, `js/${item}.js`],   // 使用chunks 需要指定entry 入口文件中的哪一个模块
        minify: {
          removeComments: true
        },
      })
    )
  })

  configJs.optimization = {
    minimizer: [
      // Uglify Js
      new UglifyJsPlugin({
        uglifyOptions: {
          ie8: false,
          safari10: true,
          ecma: 5,
          output: {
            comments: /^!/,
            beautify: false
          },
          compress: {
            warnings: false,
            drop_debugger: true,
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true
          },
          warnings: false,
          sourceMap: true
        }
      }),
    ]
  };
}

configs.push(configJs)

module.exports = configs;
