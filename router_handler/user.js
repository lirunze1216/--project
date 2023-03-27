// 导入数据库操作模块
const db = require('../db/index')

// 导入bcryptjs 这个包 用于密码加密
const bcrypt = require('bcryptjs')

// 导入生成token的包
const jwt = require('jsonwebtoken')

// 导入全局的配置文件
const config = require('../config')

// 注册新用户的处理函数
exports.regUser = (req, res) => {
  // 先拿到客户端提交到服务器的用户信息 req.body
  const userinfo = req.body

  // 对表单中的数据，进行合法性的校验,单纯使用if else的话比较麻烦出错性高
  // if (!userinfo.username || !userinfo.password) {
  //     // res.send向客户端发送错误信息
  //     return res.send({
  //         status: 1,
  //         message: '用户名或密码不合法!'
  //     })
  // }

  // 定义sql语句，查询用户名是否被占用
  const sqlStr = 'select * from ev_users where username=?'
  // 调用db.query()执行sql语句
  db.query(sqlStr, userinfo.username, (err, results) => {
    //执行sql语句失败
    if (err) return res.cc(err)
    //     return res.send({
    //         status: 1,
    //         message: err.message,
    //     })

    // 判断用户名是否被占用,因为select语句返回的results是一个数组,所以用results.length来看里面是否查询到了符合条件的数据，数组长度大于0代表已经被占用了
    if (results.length > 0) return res.cc('用户名被占用，请更换其他用户名！')
    // return res.send({
    //     status: 1,
    //     message: '用户名被占用，请更换其他用户名！',
    // })

    // TODO:用户名可以使用
    // 调用bcrypt.hashSync()方法对密码进行加密 然后交给userinfo.password
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)

    // 定义插入用户的sql语句
    const sql = 'insert into ev_users set ?'
    // 调用db.query()执行sql语句
    db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
      //执行sql语句失败
      if (err) return res.cc(err)
      // return res.send({
      //     status: 1,
      //     message: err.message,
      // })

      // 执行sql语句成功,但是行数不为1
      if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！')
      // return res.send({
      //     status: 1,
      //     message: '注册用户失败，请稍后再试！',
      // })

      // 注册成功
      // res.send({
      //     status: 0,
      //     message: '注册用户成功！',
      // })
      res.cc('注册成功', 0)
    })
  })
}

// 登录的处理函数
exports.login = (req, res) => {
  // 接受表单数据
  const userinfo = req.body
  // console.log(userinfo)
  // 定义sql语句
  const sql = 'select * from ev_users where username=?'
  // 执行sql语句，根据用户名查询用户的信息
  db.query(sql, userinfo.username, (err, results) => {
    // 执行sql语句失败
    if (err) return res.cc(err)
    // 执行sql语句成功，但是获取到的数据条数不等于1
    if (results.length !== 1) return res.cc('登陆失败!')

    // todo:判断密码是否正确
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    if (!compareResult) return res.cc('登陆失败！')

    // 登陆成功，在服务端生成token字符串,注意在生成token字符串的时候一定要剔除密码和头像的值。  ...result[0]是展开results数组
    const user = { ...results[0], password: '', user_pic: '' }
    // 对用户信息进行加密，生成token字符串，使用sign()方法
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })

    // 调用res.send()将token相应给客户端
    res.send({
      status: 0,
      message: '登陆成功！',
      token: 'Bearer ' + tokenStr,
    })
  })
}
