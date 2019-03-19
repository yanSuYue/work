/*
江西南昌单独使用的路由
未来可能废弃
*/

const express=require('express')
const router=express.Router()
const pool=require('./mysql.js').pool()


const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const cookieSession=require('cookie-session')
const uuid=require('node-uuid')

router.get('/',(req,res)=>{
  if(req.session.access){
    res.sendFile('indexJX.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.redirect('/JX/LOGIN')
  }
})

router.get('/ROMS101',(req,res)=>{
  if(req.session.access){
    res.sendFile('indexJX.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.redirect('/JX/LOGIN')
  }
})


router.get('/LOGIN',(req,res)=>{
  res.sendFile('jx_login.html',{root:__dirname+'/static/html/'},(err)=>{
    if(err) throw err;
  })
})

router.post('/loginAccess',(req,res)=>{
  console.log(req.body)

  let raw_pwd=new Buffer(req.body.pwd,'utf8')
  let usr=req.body.usr
  if(usr!='jxfs') {
    res.json({success:false,msg:'此用户无权限'})
    return;
  };
  let hash_pwd=require('crypto').createHash('md5').update(raw_pwd).digest('hex');
  pool.query('select pwd from ROMS_LOGIN where username = ?',[usr],(err,rows,field)=>{
    console.log('kk')
    if(err)throw err;
    if(rows[0].pwd===hash_pwd){
      req.session.access=req.session.access||uuid.v1()
      res.json({success:true,msg:'登录成功'})
    }else{
      res.json({success:false,msg:'用户名或密码错误'})
    }
  })
})

module.exports = router
