const path = require('path')
// webpack plugin
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // ExtractTextPlugin的替代者
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

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
        test: /\.(((sa|sc|c)ss)|less)$/,
        // use: [
        //   // { loader: 'file-loader' },
        //   {
        //     loader: 'style-loader'
        //   },
        //   // { loader: 'css-loader', options: { modules: false, importLoaders: 1 } },
        //   {
        //     loader: 'css-loader'
        //   },
        //   {
        //     loader: 'postcss-loader',
        //     options: {           // 如果没有options这个选项将会报错 No PostCSS Config found
        //       plugins: (loader) => [
        //         require('postcss-import')({ root: loader.resourcePath }),
        //         require('autoprefixer')(), //CSS浏览器兼容
        //         require('cssnano')()  //压缩css
        //       ]
        //     }
        //   }]
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('autoprefixer')(), //CSS浏览器兼容
                // require('cssnano')()  //压缩css
              ]
            }
          },
        ]
      },
      {
        test:/\.(png|svg|jpeg|jpg|gif)$/,
        use:[
          {
            loader:'file-loader',
            options: {
              // name:'[name]', // [path] 上下文环境路径
              name:'[name][sha512:hash:base64:7].[ext]', // 去缓存
              publicPath: './images/', // 公共路径
              outputPath: './images/', // 输出路径
            }
          },
          { // 图片压缩
            loader: "image-webpack-loader",
            options: {
              // bypassOnDebug: true, // webpack@1.x
              // disable: true, // webpack@2.x and newer
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          }
        ]
      },
      {
        test: /\.html$/, // 支持html中的img图片引入
        use: [
          {
            loader:'html-loader',
            options: {
              arrts: ['img:src','img:data-src'],
              minimize: false  //是否压缩html
            }
          }
        ]
      }
    ]
  },

  plugins: [
    // new ExtractTextPlugin({
    //   filename: `[name]`
    // }),
    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => `css/${name.replace(/\//g, '').replace(/\./g, '')}.[contenthash:8].css`, // 自定义css引入模块文件名称
      // filename: "css/[name].[contenthash:8].css",
      // chunkFilename: "[id].css",
    }),
    // new OptimizeCssAssetsPlugin({ // css文件压缩
    //   assetNameRegExp: /\.css$/g,
    //   cssProcessor: require('cssnano'),
    //   cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
    //   canPrint: true
    // }),
  ]
}

module.exports = config
