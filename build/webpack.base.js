const path = require('path')
// webpack plugin
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const {
  getProjectName,
} = require('../utils')

// 获取当前处理的项目名称
const projectName = getProjectName()

const config = {
  mode: 'none',
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, `../dist/${projectName}`),
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
  plugins: []

  // plugins: [
  //   new ExtractTextPlugin({
  //     filename: `[name]`
  //   }),
  //   new OptimizeCssAssetsPlugin({
  //     assetNameRegExp: /\.css$/g,
  //     cssProcessor: require('cssnano'),
  //     cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
  //     canPrint: true
  //   }),
  // ]
}

module.exports = config
