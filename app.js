const express = require('express') // 导入express
const app = express() // 创建服务器的实例对象

const joi = require('joi')

const cors = require('cors') // 导入cors中间件
app.use(cors()) // 将cors注册为全局中间件

// 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }))

// 一定要在路由之前定义res.cc函数
app.use((req, res, next) => {
  // status的值默认为1,表示失败的情况
  // err的值，可能是一个错误对象，也可能是一个错误的描述字符串
  res.cc = function (err, status = 1) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

// 一定要在路由之前配置解析token的中间件
const expressJWT = require('express-jwt')
const config = require('./config')

app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))

// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))

// 导入并注册user.js模块
const userRouter = require('./router/user.js')
const res = require('express/lib/response')
app.use('/api', userRouter)

// 导入并使用用户信息的路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 导入并使用文章分类的路由模块
const artCateRouter = require('./router/artcate')
app.use('/my/article', artCateRouter)

// 导入并使用文章的路由模块
const articleRouter = require('./router/article')
app.use('/my/article', articleRouter)

// 定义错误级别的中间件
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 身份认证失败后的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知的错误
  res.cc(err)
})

// app.get('/', (req, res) => {
//   res.render('../大事件/index.html')
// })

// 启动服务器
app.listen(3007, () => {
  console.log('api server running at http://127.0.0.1:3007')
})
