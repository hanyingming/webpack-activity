
### 技术栈
    webpack4 + babel7 + browser-sync


### 功能
    1. 支持多项目的同时开发
    2. 支持各个项目的开发、生产编译打包
    3. 支持es6语法
    4. 支持html、css文件引入图片、去缓存、图片压缩
    5. 拓展支持：选择api环境、选择开启调试、选择部署终端
    6. 提供引导脚本命令运行项目

   
### 工程设计说明
    1. 创建项目: h5Test(当前工程目录下)
    2. 启动项目: npm run dev --pro=项目名称 
    3. 启动时：自动索引项目下的html文件
    4. 自动索引项目中多页面的入口文件：
        索引入口文件规则：
            1. 识别项目下的所有html文件
            2. 根据html文件名匹配js目录下相同名称的入口js文件 并自动注入到 html 中
    5. 在入口文件中 引入相关的 css、js文件

### 工程拓展支持
    1. 项目部署终端 --env=pc or mobile  默认pc
       启动命令： npm run dev --pro=项目名称 --env=pc
       说明：mobile 时，自动注入 normalize.css 、rem.js、jQuery.js
             pc 时，自动注入 normalize.css
             
    2. 项目调试信息打印 --console=false or true  默认false
       启动命令： npm run dev --pro=项目名称 --console=false
    
    3. 项目api环境；--api=dev or test or prod 默认dev 需要在config目录下配置
       启动命令： npm run dev --pro=项目名称 --api=dev
       说明： config目录下配置的api环境变量需要配置到window
              示例： window.ServerUrl = 'http://...'

 
### 项目运行
    必须配置参数：
        --pro: 项目名称
    可配置参数： 
        --env: [pc, mobile]
        --api: [dev, test, prod]
        --console: [false, true]
        
    1.开发 支持热加载
        npm run dev --pro=项目名称 开发打包、支持source-map文件
        or
        npm run server-dev --pro=项目名称 等同于 npm run dev
        or
        npm run server-prod --pro=项目名称 生产打包
    2.生产 
        npm run build --pro=项目名称
        
    3. 脚本命令引导编译打包
       npm run dev-cli 开发打包、启动热加载、支持查看source-map 文件未压缩
       or
       npm run prod-cli 生产打包、启动热加载、项目压缩
       or
       npm run start-cli 生产打包
