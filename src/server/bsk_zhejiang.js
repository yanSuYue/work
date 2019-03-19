const path = require('path')

const express = require('express')
const app = express()


const bodyParser = require('body-parser')
const compress = require('compression')
const session = require('express-session')


const env = require('../config/env.js')
const log = require('./log.js')


app.use(compress())
app.use(session({
	cookie:{httpOnly:true,maxAge:1000*60*15},
	secret:'bsk',
	resave:false,
	saveUninitialized:true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//静态文件配置
app.use('/app/static',function(req,res,next){
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Range,Authorization,Origin, X-Requested-With, Content-Type,withCredentials,Accept");
  res.set("Access-Control-Expose-Headers","Accept-Ranges, Content-Encoding, Content-Length, Content-Range")
  next()
})


//调试跨域配置
app.use(function(req,res,next) {

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Range,Authorization,Origin, X-Requested-With, Content-Type,withCredentials,Accept");
    res.set("Access-Control-Expose-Headers", "*");
    next()

})


app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  next();
});

//增加测点数据搜索导出excel 
//app.use('/roms202/app/static',express.static('/roms/server/src/search/'))

//app.use('/roms202/app/static',express.static('/roms/server/static/'))
//app.use('/roms202/app/static',express.static('/node_server/lyy/bsk/src/search/'))

//app.use('/roms202/app/static',express.static('/node_server/lyy/bsk/static/'))
app.use('/roms202/app/static',express.static(path.resolve(__dirname,'../../static/')))
app.use('/roms202/static',express.static(path.resolve(__dirname,'../../static/')))
app.use('/roms202/app/static',express.static(env.pdfUrl))

app.use('/app/static',express.static(env.pdfUrl))
app.use('/roms202/app/static',express.static(env.baseUrl))
app.use('/app/static',express.static(env.baseUrl))
app.use('/roms202/app/static',express.static(env.companyImgUrl))
app.use('/app/static',express.static(env.companyImgUrl))
app.use('/app/static',express.static(path.resolve(__dirname,'../../upload/')))
app.use('/roms202/',express.static(path.resolve(__dirname,'../../static/')))

//跨域时会有一个安全性验证
app.options('*',(req,res,next)=>{
  console.log('跨域option请求')
  res.set("Access-Control-Allow-Headers", "Range,Authorization,Origin, X-Requested-With, Content-Type,withCredentials,Accept");
  //跨域请求option验证
  res.status(200).end()
})

app.get('*',(req,res,next)=>{
	console.log(`来自${req.ip}的访问`)
	next()
})

const login = require('../router/router-login.js')
const company = require('../router/router-company.js')
const upload = require('../router/router-upload.js')
const area = require('../router/router-area.js')
const staff = require('../router/router-staff.js')
const usr = require('../router/router-usr.js')
const device = require('../router/router-device.js')
const record = require('../router/router-record.js')
const task = require('../router/router-task.js')
const excel = require('../router/router-excel.js')
//const upload = require('../router/router-upload.js')
app.use('/roms202/app',company)
app.use('/roms202/app',upload)
app.use('/roms202/app',area)
app.use('/roms202/app',staff)
app.use('/roms202/app',upload)
app.use('/roms202/app',usr)
app.use('/roms202/app',device)
app.use('/roms202/app',record)
app.use('/roms202/app',login)
app.use('/roms202/app',task)
app.use('/roms202/app',excel)

// app.get('/guiyang/login',(req,res)=>{
//    req.session.regenerate((err)=>{
//       if(err)throw err
//       res.sendFile('loginx.html',{root:path.resolve(__dirname,'../../static/html/')},(err)=>{
//         if(err)throw err
//         console.log('fetch login')
//       })
//    })
// })


app.get('/roms202',(req,res)=>{
  if(req.session.user){
	  res.sendFile('index.html',{root:path.resolve(__dirname,'../../static/html/')},(err)=>{
		if(err)throw err
		console.log('index')
	  })
  }else{
	  res.sendFile('login.html',{root:path.resolve(__dirname,'../../static/html/')},(err)=>{
		if(err)throw err
		console.log('login')
	  })
  }
})

app.get('/roms202/logout',(req,res)=>{
  req.session.user=false;
  res.redirect('/roms202')
})

const server = app.listen(8000,()=>{

	log.info(`start listening ${server.address().port}`)
})
