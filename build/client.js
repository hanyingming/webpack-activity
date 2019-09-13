const co = require('co')
const prompt = require('co-prompt')
const chalk = require('chalk')
const inquirer = require('inquirer');
const cProcess = require('child_process')

const {
  checkoutValidDir
} = require('../utils')


// 获取NODE_ENV
const nodeEnv = process.env.NODE_ENV

// 校验参数
validParam = param => new Promise((resolve, reject) => {
  let result = process.env[`npm_config_${param.key}`]
  if(!result) {
    if(param.type === 'list') { // 选择
      inquirer
        .prompt([
          {
            type: 'list',
            name: param.key,
            message: param.message,
            choices: [
              ...param.choices,
              new inquirer.Separator(),
            ],
            filter: function(val) {
              return val.toLowerCase();
            }
          }
        ])
        .then(answers => {
          resolve(answers[param.key])
        })
    } else if(param.type === 'input') { // 输入
      co(function* () {
        if (param.message) {
          console.log(chalk.black(param.message))
        }
        return yield prompt(`${param.key}:`)
      }).then(val => {
        process.stdin.pause()
        result = val.trim()
        if (result.length > 0) {
          if(param.validInput) { // 校验输入
            if (!checkoutValidDir(result)) {
              console.log(chalk.red(`${result} is not exist。please checkout。 \n`))
              resolve(validParam(param))
            } else {
              resolve(result)
            }
          } else {
            resolve(result)
          }
        } else {
          console.log(chalk.red(`${param.key} can not input empty char!`))
          resolve(validParam(param))
        }
      })
    }
  } else {
    resolve(result)
  }
})

// 执行参数的校验过程
execValidParamFunc = (params = []) => new Promise((resolve, reject) => {
  // 递归校验输入参数
  function internalValidParams(params = [], index) {
    validParam(params[index]).then(result => {
      params[index].result = result
      if(index < params.length - 1) {
        internalValidParams(params, index+1)
      } else { // 参数校验全部通过
        resolve()
      }
    })
  }
  internalValidParams(params, 0)
})

initFunc = async() => {
  // 配置校验数据
  const params = [{
    type: 'input',
    key: 'pro', // 项目名称
    message: 'please input your projectName.',
    validInput: true
  }, {
    type: 'list',
    key: 'api', // 项目名称
    message: 'please select your api environment.',
    choices: ['dev', 'test', 'prod']
  }, {
    type: 'list',
    key: 'env', // 部署环境 ['pc', 'mobile']
    message: 'please select your deploy environment.',
    choices: ['pc', 'mobile']
  }, {
    type: 'list',
    key: 'console', // 是否注入调试
    message: 'please confirm your project reject vConsole.',
    choices: ['false', 'true']
  }]
  // 校验必要参数是否输入 pro: 项目名称； api: 项目api环境
  await execValidParamFunc(params)
  const cmd = `npm run ${nodeEnv} ` + params.map(item => `--${item.key}=${item.result}`).join(' ')
  // 启动子线程运行webpack打包命令
  let devProcess = cProcess.exec(cmd, { detached: true }, function (error, stout, stderr) {
    if(error) console.log(error)
  })
  devProcess.stdout.pipe(process.stdout)
  devProcess.stderr.pipe(process.stderr)
}

// 执行入口
initFunc()
