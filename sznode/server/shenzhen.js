let env = process.env.NODE_ENV
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const compress = require('compression')
const session = require('express-session')
const makeDateTime = require('../controller/public/timeParse.js').makeDateTime
const app = express()
const log = require('./log.js')

//挂载在req对象上的中间件
app.listen(8000,'0.0.0.0',()=>console.log('http://120.77.153.63:8000/login'))
app.use(compress())
app.use(session({
	cookie:{httpOnly:true,maxAge:1000*60*15},
	secret:'ROMS-OA',
	resave:false,
	saveUninitialized:true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//静态文件配置
app.use('/static',function(req,res,next){
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Range,Authorization,Origin, X-Requested-With, Content-Type,withCredentials,Accept");
  res.set("Access-Control-Expose-Headers","Accept-Ranges, Content-Encoding, Content-Length, Content-Range")
  next()
})

	console.log('生产环境静态文件路由')
	app.use('/',express.static(path.resolve(__dirname,'../client/')))
	app.use('/',express.static(path.resolve(__dirname,'../client/')))
	app.use('/dist',express.static(path.resolve(__dirname,'../client/dist')))
	
	app.use('/static',express.static('/roms/web/roms/'))
	app.use('/static',express.static('/roms/web/roms/staffImg'))
	app.use('/static',express.static('/roms/tomcat6/webapps/roms/roms_sz/'))
	app.use('/static',express.static(path.resolve(__dirname,'/roms/tomcat6/webapps/roms/staffImg/')))
	app.use('/static',express.static(path.resolve('/roms/tomcat6/webapps/roms/staffImg/')))
	app.use('/words',express.static(path.resolve(__dirname,'../upload/words')))
	app.use('/power',express.static(path.resolve(__dirname,'../upload/power')))		
	app.use('/images',express.static(path.resolve(__dirname,'../upload/images')))
	app.use('/static',express.static(path.resolve(__dirname,'../upload/imgmanage')))
	app.use('/words',express.static(path.resolve(__dirname,'../upload/words')))
	app.use('/dist',express.static(path.resolve(__dirname,'../client/dist')))



//路由管理
const staff = require('../router/router-usr.js')
const project = require('../router/router-project.js')
const task = require('../router/router-task.js')
const template = require('../router/router-template.js')
const login = require('../router/router-login.js')
const upload = require('../router/router-upload.js')
const device = require('../router/router-device.js')
const doc = require('../router/router-doc.js')
//调试跨域配置
app.use(function(req,res,next) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Range,Authorization,Origin, X-Requested-With, Content-Type,withCredentials,Accept");
  res.set("Access-Control-Expose-Headers", "*");
  next()
})


//所有请求数据的接口都挂载在app路由下
app.use('/',(req,res,next)=>{
	console.log('进入路由')
	console.log('请求时间',makeDateTime())
	next()
})

//跨域时会有一个安全性验证
app.options('*',(req,res,next)=>{
  console.log('option 请求')
  res.set("Access-Control-Allow-Headers", "Range,Authorization,Origin, X-Requested-With, Content-Type,withCredentials,Accept");
  //跨域请求option验证
  res.status(200).end()
})

//挂载路由
app.get('/',(req,res)=>{
	console.log('请求主页')
	if(req.session.access){
		res.sendFile('index.html',{root:path.resolve(__dirname,'../client/html/')})
	}else{
		res.redirect('/login');
		return false;
	}
})
app.post('/logout',(req,res)=>{
	req.session.access = false;
	res.json({success:true})
})
app.use('/',login)
app.use('/',staff)
app.use('/',project)
app.use('/',task)
app.use('/',template)
app.use('/',upload)
app.use('/',device)
app.use('/',doc)