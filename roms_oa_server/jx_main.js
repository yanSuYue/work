const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const cookieSession=require('cookie-session')
const uuid=require('node-uuid')
const router=require('./router.js')
const JX=require('./jx.js')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieSession({
  name:'loginSession',
  keys:['ROMS201'],
  maxAge:1000*60*30
}))

app.enable('trust proxy')
app.use('/ROMS-OA',express.static('static'))
app.use('/ROMS-OA/ROMS101',express.static('static'))
app.use('/ROMS-OA/ROMS101',express.static('static'))
app.use('/ROMS-OA/ROMS201',express.static('static'))
app.use('/JX',express.static('static'))
app.use('/JX/ROMS101',express.static('static'))

//app.use('/ROMS-OA',router)
app.use('/JX',JX)
app.listen(1030,()=>{
  console.log('ROMS201项目  正在监听1030端口')
})