const express=require('express')
const router=express.Router()
const pool=require('./mysql.js').pool()

const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const cookieSession=require('cookie-session')
const uuid=require('node-uuid')

router.get('/',(req,res)=>{
  console.log('进入主路由')
  if(req.session.access){
    console.log('sesion正常')
    // res.sendFile('check.html',{root:__dirname+'/static/html/'},(err)=>{
    //   if(err) throw err;
    // })
    res.sendFile('checkSubtype.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })

  }else{
    console.log('no session')
    console.log(req.session)
    //res.redirect('/ROMS-OA/LOGIN')
    res.redirect('/ROMS-OA/Test')
  }
})

//第一版的模块选择路由
router.get('/CHECK',(req,res)=>{
  if(req.session.access){
    res.sendFile('check.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.redirect('/ROMS-OA/LOGIN')
  }
})

router.get('/subtype-check',(req,res)=>{
  if(req.session.access){
    res.sendFile('checkSubtype.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.redirect('/ROMS-OA/Test')
  }
})

//单模块下的正常的跳转路由
router.get('/subtype',(req,res)=>{
  if(req.session.accessB){
    console.log(req.session)
    console.log(req.session.accessB)
    console.log('accessB')
    res.redirect('/ROMS-OA/B')
  }else if(req.session.accessC){
    console.log(req.session.accessC)
    console.log('accessC')
    res.redirect('/ROMS-OA/C')
  }else if(req.session.accessD){
    console.log(req.session.accessD)
    console.log('accessD')
    res.redirect('/ROMS-OA/D')
  }else{
    console.log(req.session)
  }
})


router.get('/roms101/B',(req,res)=>{
  if(req.session.accessB){
    res.sendFile('index102-B.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
      res.redirect('/ROMS-OA/Test')
  }
})

router.get('/roms101/C',(req,res)=>{
  if(req.session.accessC){
    res.sendFile('index102-C.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.send("<h1>无权限访问</h1>")
  }
})

router.get('/roms101/D',(req,res)=>{
  if(req.session.accessD){
    res.sendFile('index102-D.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.send("<h1>无权限访问</h1>")
  }
})

router.get('/roms201/B',(req,res)=>{
  if(req.session.accessB){
    res.sendFile('index202-B.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.send("<h1>无权限访问</h1>")
  }
})

router.get('/roms201/C',(req,res)=>{
  if(req.session.accessC){
    res.sendFile('index202-C.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.send("<h1>无权限访问</h1>")
  }
})

router.get('/roms201/D',(req,res)=>{
  if(req.session.accessD){
    res.sendFile('index202-D.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.send("<h1>无权限访问</h1>")
  }
})

//多个模块下的路由跳转
router.get('/roms101/subtype',(req,res)=>{
  if(req.session.accessB){
    console.log(req.session)
    console.log(req.session.accessB)
    console.log('accessB')
    res.redirect('/ROMS-OA/roms101/B')
  }else if(req.session.accessC){
    console.log(req.session.accessC)
    console.log('accessC')
    res.redirect('/ROMS-OA/roms101/C')
  }else if(req.session.accessD){
    console.log(req.session.accessD)
    console.log('accessD')
    res.redirect('/ROMS-OA/roms101/D')
  }else{
    console.log(req.session)
  }
})
router.get('/roms201/subtype',(req,res)=>{
  if(req.session.accessB){
    console.log(req.session)
    console.log(req.session.accessB)
    console.log('accessB')
    res.redirect('/ROMS-OA/roms201/B')
  }else if(req.session.accessC){
    console.log(req.session.accessC)
    console.log('accessC')
    res.redirect('/ROMS-OA/roms201/C')
  }else if(req.session.accessD){
    console.log(req.session.accessD)
    console.log('accessD')
    res.redirect('/ROMS-OA/roms201/D')
  }else{
    console.log(req.session)
  }
})



router.get('/ROMS101',(req,res)=>{
  if(req.session.access){
    res.sendFile('index101.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.redirect('/ROMS-OA/LOGIN')
  }
})

router.get('/ROMS201',(req,res)=>{
  if(req.session.access){
    res.sendFile('index201.html',{root:__dirname+'/static/html/'},(err)=>{
      if(err) throw err;
    })
  }else{
    res.redirect('/ROMS-OA/LOGIN')
  }
})

router.get('/LOGIN',(req,res)=>{
  res.sendFile('login.html',{root:__dirname+'/static/html/'},(err)=>{
    if(err) throw err;
  })
})
router.get('/Test',(req,res)=>{
  res.sendFile('login_subtype.html',{root:__dirname+'/static/html/'},(err)=>{
    if(err) throw err;
  })
})
router.post('/loginAccess',(req,res)=>{
  let raw_pwd=new Buffer(req.body.pwd,'utf8')
  let usr=req.body.usr
  let hash_pwd=require('crypto').createHash('md5').update(raw_pwd).digest('hex');
  pool.query('select pwd from ROMS_LOGIN where username = ?',[usr],(err,rows,field)=>{
    if(err)throw err;
    if(rows[0].pwd===hash_pwd){
      req.session.access=req.session.access||uuid.v1()
      res.json({success:true,msg:'登录成功'})
    }else{
      res.json({success:false,msg:'用户名或密码错误'})
    }
  })
})

router.post('/subtypeAccess',(req,res)=>{
  console.log(req.body)
  let raw_pwd=new Buffer(req.body.pwd,'utf8')
  let usr=req.body.usr
  let hash_pwd=require('crypto').createHash('md5').update(raw_pwd).digest('hex');
  pool.query('select id,pwd,systype,subtype from ROMS_LOGIN where username = ?',[usr],(err,rows,field)=>{
    if(err)throw err;
    //判断是否是101,201系统并且验证密码
    if(rows[0].pwd===hash_pwd&&rows[0].systype==='0000110000'){
      res.cookie('userId',rows[0].id)
      if(rows[0].subtype==0){
        console.log('subtype 0')
        req.session.regenerate(function(err) {
          if(err)throw err;
          req.session.access=uuid.v1()
          req.session.accessC=uuid.v1()
          console.log(req.session)
          res.json({success:true,msg:'登录成功'})
        })
      }else if(rows[0].subtype==1){
        req.session.regenerate(function(err) {
          if(err)throw err;
          req.session.access=uuid.v1()
          req.session.accessB=uuid.v1()
          res.json({success:true,msg:'登录成功'})
        })
      }else if(rows[0].subtype==2){
        req.session.regenerate(function(err){
          if(err)throw err;
          req.session.access=uuid.v1()
          req.session.accessD=uuid.v1()
          res.json({success:true,msg:'登录成功'})
        })
      }else{
        //todo
      }

    }else{
      res.json({success:false,msg:'此用户无登录权限'})
    }
  })
})

module.exports = router
