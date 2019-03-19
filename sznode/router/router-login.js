const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')
const path = require('path')
const crypto = require('crypto')
const login = require('../controller/sql/login.js')
function md5(id){
	const md5 = crypto.createHash("md5")
	const hash = md5.update(id).digest('base64');
	return hash;
}
router.get('/login',(req,res)=>{
	console.log('请求登录页')
	if(req.session.access){
		res.redirect('/');
		return false;
	}
	res.sendFile('login.html',{root:path.resolve(__dirname,'..','client/html/')},(err)=>{
		if(err)console.log('登录界面报错',err)
		console.log('登录页')
	})
})
router.get('/logout',(req,res)=>{
	req.session.access=false
	res.sendFile('login.html',{root:path.resolve(__dirname,'..','client/html/')},(err)=>{
		if(err)console.log('登录界面报错',err)
		console.log('登录页')
	})
})
//updatepwd
router.post('/updatepwd',(req,res)=>{
	login.updatepwd({
		staffId:req.body.staffId,
		oldpwd:(md5(md5(req.body.usr).substring(2,8))+md5('xtroms')),
		pwd:(md5(md5(req.body.pwd).substring(2,8))+md5('xtroms')),
	},res)
})
router.post('/login',(req,res)=>{
	console.log((md5(md5(req.body.pwd).substring(2,8))+md5('xtroms')))
	login.islogin({
		username:req.body.usr,
		pwd:(md5(md5(req.body.pwd).substring(2,8))+md5('xtroms'))
	}).then(function(e){
		console.log(e)
		res.json(e);
	})
	req.session.admin = e.admin;
	req.session.access = uuid()
})

module.exports = router