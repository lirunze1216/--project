// 导入数据库操作模块
const db = require('../db/index')

// 导入处理密码的模块
const bcrypt = require('bcryptjs')

// 获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {
  // 定义查询用户信息的sql语句
  const sql = 'select id, username, nickname, email, user_pic from ev_users where id=?'
  // 调用db.query()执行sql语句
  db.query(sql, req.user.id, (err, results) => {
    // 执行sql语句失败
    if (err) return res.cc(err)
    // 执行sql语句成功，但长度可能为空
    if (results.length !== 1) return res.cc('查询用户信息失败')
    // 用户信息获取成功
    res.send({
      status: 0,
      message: '获取用户信息成功!',
      data: results[0],
    })
  })
}

// 更新用户信息的处理函数
exports.updateUserInfo = (req, res) => {
  // 定义sql语句
  const sql = 'update ev_users set ? where id=?'
  // 调用db.query()执行sql语句并传递参数
  db.query(sql, [req.body, req.body.id], (err, results) => {
    // 执行sql语句失败
    if (err) return res.cc(err)
    // 执行sql语句成功，但是影响行数不等于1
    if (results.affectedRows !== 1) return res.cc('更新用户的基本信息失败！')
    // 更新用户信息成功
    res.cc('更新用户信息成功！')
  })
}

// 修改用户密码的处理函数
exports.updatePassword = (req, res) => {
  // 根据id查询用户的信息
  const sql = 'select * from ev_users where id=?'
  // 执行根据id查询用户的信息的sql语句
  db.query(sql, req.user.id, (err, results) => {
    // 执行语句失败
    if (err) return res.cc(err)
    // 判断结果是否存在
    if (results.length !== 1) return res.cc('用户不存在！')

    // 判断用户输入的旧密码是否正确
    const compareResults = bcrypt.compareSync(req.body.oldPwd, results[0].password)
    if (!compareResults) return res.cc('旧密码错误！')

    // 定义更新密码的sql语句
    const sql = 'update ev_users set password=? where id=?'
    // 对新密码进行加密处理
    const newPwd = bcrypt.hashSync(req.body.newPwd, 10)
    // 执行sql语句
    db.query(sql, [newPwd, req.user.id], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('修改密码失败！')
      res.cc('修改密码成功！', 0)
    })
  })
}

// 更改用户头像的处理函数
exports.updateAvatar = (req, res) => {
  const sql = 'update ev_users set user_pic=? where id=?'
  db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更改用户的头像失败！')
    res.cc('更改用户头像成功', 0)
  })
}
