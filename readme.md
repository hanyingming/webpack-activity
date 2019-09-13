
### 技术栈
    webpack4 + babel7 + browser-sync

### 功能
    快速构建h5多页面项目。
    

### 工程设计说明
    1. 创建项目: h5Test(当前工程目录下)
    2. 启动项目: npm run dev 项目名称 
    3. 启动时：自动索引项目下的html文件
    4. 自动索引项目中多页面的入口文件：
        索引入口文件规则：
            1. 识别项目下的所有html文件
            2. 根据html文件名匹配js目录下相同名称的入口js文件 并自动注入到 html 中
    5. 在入口文件中 引入相关的 css、js文件
    
### 项目运行
    1.开发
        npm run dev --pro=项目目录
    2.打包
        npm run build --pro=项目目录
         
