const path = require('path')
const fs = require("fs")
const glob = require('globby')
const chalk = require('chalk')

// 获取项目名称
const getProjectName = () => {
  const projectName = process.env.npm_config_pro
  return projectName
}

// 获取api环境；分为 dev,test,prod三种；默认采用dev
const getApiEnv = () => {
  let api = process.env.npm_config_api || ''
  api = api.toLocaleLowerCase()
  return ['dev', 'test', 'prod'].includes(api) ? api : 'dev'
}

// 获取部署终端类型; mobile：移动端；pc: 浏览器; 默认采用pc
const rejectRemJs = () => {
  let env = process.env.npm_config_env
  env = env && env.toLocaleLowerCase() || 'pc'
  return 'mobile' === env ? true : false
}

// 是否启用vConsole; 默认不启用
const rejectVConsole = () => {
  let vConsole = process.env.npm_config_console
  return vConsole || false
}

// 系统终止，提示异常原因信息
const systemExitThrowException = (error) => {
  console.error(chalk.red(error))
  process.exit(1)
  return
}

// 校验目录是否存在
const checkoutValidDir = (dir) => {
  const dirExist = fs.existsSync(path.join(__dirname, dir))
  return dirExist ? true : false
}


// 获取项目 多页面的入口文件
// 1. 获取所有html文件名集合
// 2. 根据html文件名去匹配js目录下的js文件；匹配到的js文件作为html页面的入口文件
const getAllEntries = (projectName, htmlArr) => {
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
  return getJsEntries(JS_PATH)
}

// 1. 获取html文件名集合
const getHtmlNameArray = (projectName) => {
  // html 入口配置
  const HTML_PATH = {
    pattern: [`./${projectName}/*.html`],
    src: path.join(__dirname, `${projectName}`),
  }

  // 获取html文件名集合
  function getHtmlFileNames(config) {
    const fileList = glob.sync(config.pattern)
    return fileList.map(function(item) {
      const filePath = path.parse(path.relative(config.src, item))
      return filePath.name
    })
  }

  // 所有匹配的html文件名称集合
  return getHtmlFileNames(HTML_PATH)
}

exports = module.exports = {
  getProjectName,
  getApiEnv,
  rejectRemJs,
  rejectVConsole,
  checkoutValidDir,
  systemExitThrowException,
  getHtmlNameArray,
  getAllEntries,
}
