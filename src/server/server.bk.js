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
app.use('/guiyang/app/static',express.static('/node_server/lyy/bsk/static/'))
app.use('/guiyang/app/static',express.static(path.resolve(__dirname,'../../static/')))
app.use('/guiyang/static',express.static(path.resolve(__dirname,'../../static/')))
console.log('enennenennnenenn',env.pdfUrl)
app.use('/guiyang/app/static',express.static(env.pdfUrl))

app.use('/app/static',express.static(env.pdfUrl))
app.use('/guiyang/app/static',express.static(env.baseUrl))
app.use('/app/static',express.static(env.baseUrl))
app.use('/guiyang/app/static',express.static(env.companyImgUrl))
app.use('/app/static',express.static(env.companyImgUrl))
app.use('/app/static',express.static(path.resolve(__dirname,'../../upload/')))
app.use('/guiyang/',express.static(path.resolve(__dirname,'../../static/')))

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
app.use('/guiyang/app',company)
app.use('/guiyang/app',upload)
app.use('/guiyang/app',area)
app.use('/guiyang/app',staff)
app.use('/guiyang/app',upload)
app.use('/guiyang/app',usr)
app.use('/guiyang/app',device)
app.use('/guiyang/app',record)
app.use('/guiyang/app',login)
app.use('/guiyang/app',task)
app.use('/guiyang/app',excel)

app.get('/guiyang/login',(req,res)=>{
   req.session.regenerate((err)=>{
      if(err)throw err
      res.sendFile('loginx.html',{root:path.resolve(__dirname,'../../static/html/')},(err)=>{
        if(err)throw err
        console.log('fetch login')
      })
   })
})


app.get('/guiyang',(req,res)=>{
  console.log(req.session.admin,'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
if(!req.session.admin&&!req.session.stationId&&!req.session.excel){
    res.redirect('/guiyang/login')
  }else{
      res.sendFile('index.html',{root:path.resolve(__dirname,'../../static/html/')},(err)=>{
      if(err)throw err
      console.log('fetch index')
    })
  }
})

const server = app.listen(6566,()=>{

	log.info(`start listening ${server.address().port}`)
})
